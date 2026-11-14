# Apps Script の画面（../コード/*.html）から、GitHub Pages 版の画面を作る。画面を直したら
#   python3 build.py
# を実行して、できた html を GitHub に上げ直す（Apps Script 版と同じ見た目・動きのまま、URL とアイコンだけ違う）
import os, re
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', 'コード')
PAGES = [('menu.html', 'index.html', '住宅設備'), ('yotei.html', 'yotei.html', '商談予定'), ('index.html', 'closer.html', 'クローザー入力'),
         ('tataki.html', 'tataki.html', '叩きカウンター'), ('ap.html', 'ap.html', '催事 お客様登録')]
HEAD = '''<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="住宅設備">
<meta name="theme-color" content="#18202e">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icon-180.png">
<title>{title}</title>
<script src="api.js"></script>'''

lf = open(os.path.join(SRC, 'lf.html'), encoding='utf-8').read()
for src, out, title in PAGES:
    s = open(os.path.join(SRC, src), encoding='utf-8').read()
    reps = [('<meta charset="utf-8">', HEAD.replace('{title}', title)),
            ("<?!= include('lf') ?>", lf + '<link rel="stylesheet" href="app.css">'),
            ('<?= url ?>?page=closer', 'closer.html'), ('<?= url ?>?page=yotei', 'yotei.html'),
            ('<?= url ?>?page=tataki', 'tataki.html'), ('<?= url ?>?page=ap', 'ap.html'),
            ('<?= url ?>', 'index.html'), ('<?= title ?>', title),
            ("if (appUrl) window.open(appUrl + '?page=yotei', '_top')", "location.href = 'yotei.html'")]
    for a, b in reps:
        s = s.replace(a, b)
    assert '<?' not in s, src + ' にテンプレートの記号が残っています'
    open(os.path.join(HERE, out), 'w', encoding='utf-8').write(s)
    print(out)
