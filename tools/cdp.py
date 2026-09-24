#!/usr/bin/env python3
"""Minimal headless-Chrome test harness (stdlib only, no pip needed).

Loads a page, collects console messages + uncaught exceptions, optionally runs
JavaScript steps and takes screenshots. Chrome runs are serialised with a file
lock so several agents can use this tool at the same time without exhausting RAM.

Examples
  python3 tools/cdp.py index.html --wait 6 --shot /tmp/x.png
  python3 tools/cdp.py index.html --hash "scene=blackHole" --wait 8 --shot bh.png
  python3 tools/cdp.py index.html --wait 5 --eval "App.goToScene('supernova')" --wait 4 --shot sn.png
  python3 tools/cdp.py index.html --wait 5 --eval "JSON.stringify(App.debugInfo())"
  python3 tools/cdp.py index.html --steps steps.json     # [["wait",3],["eval","..."],["shot","a.png"]]

Steps run in the order given on the command line. Exit code 1 if any uncaught
exception or console.error happened (after filtering known-harmless noise).
"""
import argparse, base64, fcntl, json, os, random, shutil, socket, struct, subprocess, sys, tempfile, time, urllib.request

CHROME = shutil.which('google-chrome') or shutil.which('google-chrome-stable') or shutil.which('chromium')
LOCK = os.path.join(tempfile.gettempdir(), 'solar-class-cdp.lock')
NOISE = ('GPU stall due to ReadPixels', 'Automatic fallback to software WebGL', 'favicon.ico',
         'WebGL-', 'GroupMarkerNotSet')


class WS:
    def __init__(self, url):
        assert url.startswith('ws://')
        hostport, path = url[5:].split('/', 1)
        host, port = hostport.split(':')
        self.s = socket.create_connection((host, int(port)), timeout=60)
        key = base64.b64encode(os.urandom(16)).decode()
        req = (f'GET /{path} HTTP/1.1\r\nHost: {hostport}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n'
               f'Sec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n')
        self.s.sendall(req.encode())
        buf = b''
        while b'\r\n\r\n' not in buf:
            chunk = self.s.recv(4096)
            if not chunk:
                raise RuntimeError('websocket handshake failed')
            buf += chunk
        self.buf = buf.split(b'\r\n\r\n', 1)[1]

    def send(self, text):
        data = text.encode()
        hdr = bytearray([0x81])
        n = len(data)
        if n < 126:
            hdr.append(0x80 | n)
        elif n < 65536:
            hdr.append(0x80 | 126); hdr += struct.pack('>H', n)
        else:
            hdr.append(0x80 | 127); hdr += struct.pack('>Q', n)
        mask = os.urandom(4)
        hdr += mask
        self.s.sendall(bytes(hdr) + bytes(b ^ mask[i % 4] for i, b in enumerate(data)))

    def _parse(self):
        """Return (message_or_None, consumed) for one complete frame in self.buf, else None."""
        b = self.buf
        if len(b) < 2:
            return None
        b1, b2 = b[0], b[1]
        n, off = b2 & 0x7F, 2
        if n == 126:
            if len(b) < 4: return None
            n, off = struct.unpack('>H', b[2:4])[0], 4
        elif n == 127:
            if len(b) < 10: return None
            n, off = struct.unpack('>Q', b[2:10])[0], 10
        if len(b) < off + n:
            return None
        self.buf = b[off + n:]
        return (b1 & 0x80, b1 & 0x0F, b[off:off + n])

    def recv(self):
        """Read one complete message. socket.timeout may propagate but never corrupts state."""
        while True:
            fr = self._parse()
            if fr is None:
                chunk = self.s.recv(1 << 20)
                if not chunk:
                    raise RuntimeError('websocket closed')
                self.buf += chunk
                continue
            fin, op, payload = fr
            if op == 0x8:
                raise RuntimeError('websocket closed by peer')
            if op in (0x9, 0xA):
                continue
            self.partial = getattr(self, 'partial', b'') + payload
            if fin:
                msg, self.partial = self.partial, b''
                return msg.decode('utf-8', 'replace')


class Chrome:
    def __init__(self, width, height, gpu):
        self.port = random.randint(20000, 40000)
        self.tmp = tempfile.mkdtemp(prefix='cdp-')
        flags = [CHROME, '--headless=new', f'--remote-debugging-port={self.port}', f'--user-data-dir={self.tmp}',
                 f'--window-size={width},{height}', '--no-first-run', '--no-default-browser-check',
                 '--hide-scrollbars', '--mute-audio', '--allow-file-access-from-files',
                 '--autoplay-policy=no-user-gesture-required', '--enable-webgl', '--ignore-gpu-blocklist']
        if gpu:
            flags += ['--use-angle=gl', '--enable-gpu']
        else:
            flags += ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']
        flags.append('about:blank')
        self.proc = subprocess.Popen(flags, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        ws_url = None
        for _ in range(100):
            try:
                tabs = json.load(urllib.request.urlopen(f'http://127.0.0.1:{self.port}/json', timeout=1))
                pages = [t for t in tabs if t.get('type') == 'page']
                if pages:
                    ws_url = pages[0]['webSocketDebuggerUrl']; break
            except Exception:
                pass
            time.sleep(0.1)
        if not ws_url:
            self.close(); raise RuntimeError('could not connect to chrome')
        self.ws = WS(ws_url)
        self.id = 0
        self.events = []

    def call(self, method, params=None, timeout=60):
        self.id += 1
        my = self.id
        self.ws.send(json.dumps({'id': my, 'method': method, 'params': params or {}}))
        end = time.time() + timeout
        while time.time() < end:
            m = json.loads(self.ws.recv())
            if m.get('id') == my:
                if 'error' in m:
                    raise RuntimeError(f"{method}: {m['error']}")
                return m.get('result', {})
            if 'method' in m:
                self.events.append(m)
        raise TimeoutError(method)

    def pump(self, seconds):
        end = time.time() + seconds
        self.ws.s.settimeout(0.2)
        while time.time() < end:
            try:
                m = json.loads(self.ws.recv())
                if 'method' in m:
                    self.events.append(m)
            except (socket.timeout, TimeoutError):
                pass
            except OSError:
                pass
        self.ws.s.settimeout(60)

    def close(self):
        try:
            self.proc.terminate(); self.proc.wait(5)
        except Exception:
            try: self.proc.kill()
            except Exception: pass
        shutil.rmtree(self.tmp, ignore_errors=True)


def fmt_remote(obj):
    if 'value' in obj:
        v = obj['value']
        return v if isinstance(v, str) else json.dumps(v)
    return obj.get('description') or obj.get('unserializableValue') or obj.get('type', '')


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('page')
    ap.add_argument('--hash', default='', help='URL hash to append (without #)')
    ap.add_argument('--query', default='', help='URL query to append (without ?)')
    ap.add_argument('--size', default='1440x900')
    ap.add_argument('--mobile', action='store_true', help='emulate a 390x844 touch phone')
    ap.add_argument('--gpu', action='store_true', help='try the real GPU instead of SwiftShader')
    ap.add_argument('--wait', action='append', type=float, dest='steps_wait')
    ap.add_argument('--eval', action='append', dest='steps_eval')
    ap.add_argument('--shot', action='append', dest='steps_shot')
    ap.add_argument('--steps', help='JSON file with a list of [kind, arg] steps')
    ap.add_argument('--quiet', action='store_true', help='only print errors/warnings + eval results')
    # preserve CLI order of --wait/--eval/--shot
    steps = []
    argv = sys.argv[1:]
    i = 0
    while i < len(argv):
        a = argv[i]
        if a in ('--wait', '--eval', '--shot') and i + 1 < len(argv):
            steps.append([a[2:], argv[i + 1]]); i += 2; continue
        i += 1
    args = ap.parse_args()
    if args.steps:
        steps = json.load(open(args.steps))
    if not steps:
        steps = [['wait', 5]]

    path = os.path.abspath(args.page)
    url = 'file://' + path + (('?' + args.query) if args.query else '') + (('#' + args.hash) if args.hash else '')
    w, h = map(int, args.size.split('x'))
    if args.mobile:
        w, h = 390, 844

    lockf = open(LOCK, 'w')
    fcntl.flock(lockf, fcntl.LOCK_EX)
    chrome = None
    errors, warnings, logs, results = [], [], [], []
    try:
        chrome = Chrome(w, h, args.gpu)
        chrome.call('Runtime.enable'); chrome.call('Page.enable'); chrome.call('Log.enable')
        if args.mobile:
            chrome.call('Emulation.setDeviceMetricsOverride', {'width': w, 'height': h, 'deviceScaleFactor': 2, 'mobile': True})
            chrome.call('Emulation.setTouchEmulationEnabled', {'enabled': True, 'maxTouchPoints': 5})
        else:
            chrome.call('Emulation.setDeviceMetricsOverride', {'width': w, 'height': h, 'deviceScaleFactor': 1, 'mobile': False})
        chrome.call('Page.navigate', {'url': url})
        try:
          for kind, arg in steps:
              if kind == 'wait':
                  chrome.pump(float(arg))
              elif kind == 'eval':
                  r = chrome.call('Runtime.evaluate', {'expression': arg, 'awaitPromise': True, 'returnByValue': True}, timeout=120)
                  if 'exceptionDetails' in r:
                      ed = r['exceptionDetails']
                      msg = ed.get('exception', {}).get('description') or ed.get('text')
                      errors.append(f'[eval exception] {arg[:80]} -> {msg}')
                      results.append({'eval': arg, 'error': msg})
                  else:
                      results.append({'eval': arg, 'result': r.get('result', {}).get('value')})
              elif kind == 'shot':
                  r = chrome.call('Page.captureScreenshot', {'format': 'png'}, timeout=120)
                  os.makedirs(os.path.dirname(os.path.abspath(arg)), exist_ok=True)
                  with open(arg, 'wb') as f:
                      f.write(base64.b64decode(r['data']))
                  results.append({'shot': os.path.abspath(arg)})
        except Exception as ex:
            errors.append(f'[harness] step failed: {ex!r} (page crashed or hung?)')
        try:
            chrome.pump(0.3)
        except Exception:
            pass
    finally:
        if chrome:
            chrome.close()
        fcntl.flock(lockf, fcntl.LOCK_UN)

    for e in chrome.events:
        m, p = e['method'], e.get('params', {})
        if m == 'Runtime.consoleAPICalled':
            text = ' '.join(fmt_remote(a) for a in p.get('args', []))
            if any(n in text for n in NOISE):
                continue
            t = p.get('type')
            (errors if t == 'error' else warnings if t in ('warning', 'warn') else logs).append(f'[console.{t}] {text}')
        elif m == 'Runtime.exceptionThrown':
            d = p.get('exceptionDetails', {})
            desc = d.get('exception', {}).get('description') or d.get('text')
            errors.append(f"[uncaught] {desc} (line {d.get('lineNumber')}, col {d.get('columnNumber')})")
        elif m == 'Log.entryAdded':
            en = p.get('entry', {})
            text = en.get('text', '')
            if any(n in text for n in NOISE):
                continue
            if en.get('level') == 'error':
                errors.append(f"[log.error] {text} {en.get('url', '')}")
            elif en.get('level') == 'warning':
                warnings.append(f'[log.warning] {text}')

    if not args.quiet:
        for l in logs[-60:]:
            print(l)
    for wmsg in warnings[-40:]:
        print(wmsg)
    for r in results:
        print(json.dumps(r, ensure_ascii=False)[:4000])
    for e in errors:
        print(e)
    print(f'== {len(errors)} error(s), {len(warnings)} warning(s)')
    sys.exit(1 if errors else 0)


if __name__ == '__main__':
    main()
