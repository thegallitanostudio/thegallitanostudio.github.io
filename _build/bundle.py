#!/usr/bin/env python3
"""thegallitanostudio.com · stylesheet bundler (Oct 17, 2026; audit P3, Angela's pick A).

Each page keeps a manifest of its stylesheets, in load order, in one comment in its <head>:

    <!-- css-manifest: site.css, cred.css, ..., motion.css, oct18-audit.css -->

Authoring does not change: new styling goes in a new file, added to the END of the manifest on every
page that needs it. Never edit the older files. Then run this script from the repository root:

    python3 _build/bundle.py

It concatenates the listed files (in order) into css/bundle-<page>.css and points the page's one
<link rel="stylesheet"> at it, with a content hash as the version string so browsers refetch on change.
Commit the regenerated bundles with the page. The source files stay in css/ for reading and history.

First run: a page with no manifest gets one built from its existing <link rel="stylesheet"> tags.
"""
import hashlib, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES = ['index.html', 'about/index.html', 'book/index.html', 'contact/index.html', 'questions/index.html',
         'executiveos/index.html', 'for-companies/index.html', 'for-companies/business-case/index.html',
         'work-with-me/index.html', 'work-with-me/executive/index.html', 'work-with-me/first-look/index.html']
LINK = re.compile(r'<link rel="stylesheet" href="((?:\.\./)*)css/([^"?]+)(?:\?v=[^"]*)?">\n?')
MANIFEST = re.compile(r'<!-- css-manifest: ([^>]*) -->\n?')

def slug(page):
    return 'home' if page == 'index.html' else page.replace('/index.html', '').replace('/', '-')

def build(page):
    path = os.path.join(ROOT, page)
    html = open(path, encoding='utf-8').read()
    head_end = html.index('</head>')
    head, body = html[:head_end], html[head_end:]
    links = LINK.findall(head)
    prefix = links[0][0] if links else ('../' * (page.count('/')))
    m = MANIFEST.search(head)
    if m:
        files = [f.strip() for f in m.group(1).split(',') if f.strip()]
    else:
        files = [f for _, f in links if not f.startswith('bundle-')]
    if not files:
        print(f'{page}: no stylesheets found'); return
    parts = []
    for f in files:
        src = os.path.join(ROOT, 'css', f)
        css = open(src, encoding='utf-8').read()
        parts.append(f'/* ===== {f} ===== */\n{css.strip()}\n')
    bundle = '\n'.join(parts)
    digest = hashlib.sha256(bundle.encode('utf-8')).hexdigest()[:8]
    out_name = f'bundle-{slug(page)}.css'
    open(os.path.join(ROOT, 'css', out_name), 'w', encoding='utf-8').write(bundle)
    # rewrite the head: one manifest comment, one link, where the first stylesheet link was
    head = MANIFEST.sub('', head)
    first = LINK.search(head)
    insert_at = first.start() if first else len(head)
    head = LINK.sub('', head)
    tag = f'<!-- css-manifest: {", ".join(files)} -->\n<link rel="stylesheet" href="{prefix}css/{out_name}?v={digest}">\n'
    head = head[:insert_at] + tag + head[insert_at:]
    open(path, 'w', encoding='utf-8').write(head + body)
    print(f'{page}: {len(files)} files -> css/{out_name} ({len(bundle)//1024} KB, v={digest})')

if __name__ == '__main__':
    for p in PAGES:
        build(p)
