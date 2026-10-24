// node build.js → dist/azure-quest.html (página única para publicar) y dist/local.html (abrir en el navegador)
const fs = require('fs'), path = require('path');
const R = __dirname, rd = f => fs.readFileSync(path.join(R, f), 'utf8');
const safe = s => s.replace(/<\/script/gi, '<\\/script');
const content = ['w1', 'w2', 'w3'].filter(w => fs.existsSync(path.join(R, `content/${w}.js`))).map(w => safe(rd(`content/${w}.js`))).join('\n');
const page = `<title>Azure Quest</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="theme-color" content="#0a62d0">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Azure Quest">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Figtree:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap">
<style>
${rd('src/app.css')}
</style>
<main id="app" aria-live="polite"></main>
<nav id="tabs" aria-label="Secciones"></nav>
<div id="toast" role="status"></div>
<script>
${content}
</script>
<script>
${safe(rd('src/app.js'))}
</script>
`;
fs.mkdirSync(path.join(R, 'dist'), { recursive: true });
fs.writeFileSync(path.join(R, 'dist/azure-quest.html'), page);
fs.writeFileSync(path.join(R, 'dist/local.html'), `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></head><body>\n${page}</body></html>`);
// PWA para GitHub Pages → docs/
const crypto = require('crypto');
const ver = 'aq-' + crypto.createHash('sha1').update(page).digest('hex').slice(0, 10);
const docs = path.join(R, 'docs'); fs.mkdirSync(docs, { recursive: true });
fs.writeFileSync(path.join(docs, 'index.html'), `<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<link rel="manifest" href="manifest.webmanifest"><link rel="icon" href="icon-192.png"><link rel="apple-touch-icon" href="apple-touch-icon.png">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}[hidden]{display:none!important}img{max-width:100%}</style>
</head><body>
${page}<script>if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js'));</script>
</body></html>`);
for (const f of ['manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png']) fs.copyFileSync(path.join(R, 'pwa', f), path.join(docs, f));
fs.writeFileSync(path.join(docs, 'sw.js'), rd('pwa/sw.js').replace('__VERSION__', ver));
fs.writeFileSync(path.join(docs, '.nojekyll'), '');
console.log('ok', (page.length / 1024).toFixed(0) + ' KB');
