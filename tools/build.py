#!/usr/bin/env python3
"""Assemble src/ into one self-contained index.html.

Layout (files are concatenated in filename order within each folder):
  src/html/00-head.html      <!doctype> ... <head> meta (no <style>)
  src/css/*.css              -> one <style> block
  src/html/10-body.html      body markup (the static UI shell)
  src/js/*.js                -> one <script type="module"> (shared module scope!)

Options
  --out PATH        write somewhere else (default: index.html in project root)
  --exclude GLOB    leave out matching src/js or src/css files (repeatable), e.g. --exclude "5*-scene-*"
  --check           also run a quick sanity check (duplicate top-level declarations)
  --stage DIR       overlay a private work dir: DIR/js, DIR/css, DIR/html files replace
                    same-named files in src/ or are added (used by parallel agents to test
                    unpublished work without breaking anyone else's build)
"""
import argparse, fnmatch, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src')

IMPORTMAP = '''<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/"
  }
}
</script>'''


STAGE = None


def files(sub, ext, excludes):
    found = {}
    for base in [SRC] + ([STAGE] if STAGE else []):
        d = os.path.join(base, sub)
        if not os.path.isdir(d):
            continue
        for f in os.listdir(d):
            if not f.endswith(ext) or f.startswith('.'):
                continue
            if any(fnmatch.fnmatch(f, pat) for pat in excludes):
                continue
            found[f] = os.path.join(d, f)
    return [found[k] for k in sorted(found)]


def html_part(name):
    if STAGE and os.path.exists(os.path.join(STAGE, 'html', name)):
        return os.path.join(STAGE, 'html', name)
    return os.path.join(SRC, 'html', name)


def read(p):
    with open(p, encoding='utf-8') as fh:
        return fh.read()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default=os.path.join(ROOT, 'index.html'))
    ap.add_argument('--exclude', action='append', default=[])
    ap.add_argument('--check', action='store_true')
    ap.add_argument('--stage', default=None)
    a = ap.parse_args()
    global STAGE
    STAGE = os.path.abspath(a.stage) if a.stage else None

    head = read(html_part('00-head.html'))
    body = read(html_part('10-body.html'))
    css_parts = [f'/* ---- {os.path.basename(p)} ---- */\n' + read(p) for p in files('css', '.css', a.exclude)]
    js_files = files('js', '.js', a.exclude)
    js_parts = [f'// =====================================================================\n// {os.path.basename(p)}\n// =====================================================================\n' + read(p) for p in js_files]

    html = (head.rstrip() + '\n<style>\n' + '\n'.join(css_parts) + '\n</style>\n</head>\n<body>\n' + body.rstrip() + '\n'
            + IMPORTMAP + '\n<script type="module">\n' + '\n'.join(js_parts) + '\n</script>\n</body>\n</html>\n')

    for bad in ('TODO', 'FIXME', 'lorem ipsum', 'Lorem ipsum'):
        if bad in html:
            print(f'warning: "{bad}" found in output', file=sys.stderr)

    if a.check:
        decl = re.compile(r'^(?:export\s+)?(?:const|let|var|class|function)\s+([A-Za-z_$][\w$]*)', re.M)
        seen = {}
        for p in js_files:
            for m in decl.finditer(read(p)):
                seen.setdefault(m.group(1), []).append(os.path.basename(p))
        dups = {k: v for k, v in seen.items() if len(v) > 1}
        if dups:
            print('ERROR duplicate top-level declarations:', file=sys.stderr)
            for k, v in dups.items():
                print(f'  {k}: {v}', file=sys.stderr)
            sys.exit(2)

    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    with open(a.out, 'w', encoding='utf-8') as fh:
        fh.write(html)
    print(f'built {a.out}  ({len(html) / 1024:.0f} KB, {len(js_files)} js files, {len(css_parts)} css files)')


if __name__ == '__main__':
    main()
