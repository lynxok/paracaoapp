const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const root = __dirname;
const markdownPath = path.join(root, 'MANUAL_DE_USUARIO.md');
const outputPath = path.join(root, 'Manual_de_Usuario_Optica_Paracao.html');
let source = fs.readFileSync(markdownPath, 'utf8');

source = source.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, relativePath) => {
  const imagePath = path.resolve(root, relativePath);
  const extension = path.extname(imagePath).slice(1).toLowerCase();
  const mime = extension === 'jpg' || extension === 'jpeg' ? 'image/jpeg' : 'image/png';
  const base64 = fs.readFileSync(imagePath).toString('base64');
  return `![${alt}](data:${mime};base64,${base64})`;
});

marked.setOptions({ gfm: true, breaks: false });
const article = marked.parse(source);

const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Manual de Usuario — Óptica Paracao</title>
  <style>
    :root { --ink:#172033; --muted:#5f6f89; --blue:#1769e0; --line:#dce4ef; --paper:#fff; --bg:#eef3f9; }
    * { box-sizing:border-box; }
    html { scroll-behavior:smooth; }
    body { margin:0; background:var(--bg); color:var(--ink); font:16px/1.65 system-ui,-apple-system,"Segoe UI",sans-serif; }
    header { background:linear-gradient(135deg,#081426,#12366d); color:#fff; padding:42px 24px; }
    header div { max-width:1080px; margin:auto; }
    header h1 { margin:0 0 8px; font-size:clamp(30px,5vw,48px); }
    header p { margin:0; color:#cfe0ff; }
    .toolbar { position:sticky; top:0; z-index:5; display:flex; justify-content:flex-end; gap:10px; max-width:1080px; margin:0 auto; padding:12px 18px; background:rgba(238,243,249,.94); backdrop-filter:blur(10px); }
    button { border:0; border-radius:9px; padding:10px 15px; background:var(--blue); color:#fff; font-weight:700; cursor:pointer; }
    main { max-width:1080px; margin:0 auto 48px; background:var(--paper); padding:clamp(24px,5vw,64px); border-radius:18px; box-shadow:0 18px 55px rgba(28,50,80,.12); }
    h1,h2,h3 { line-height:1.2; scroll-margin-top:80px; }
    main h1 { font-size:2.25rem; border-bottom:3px solid var(--blue); padding-bottom:12px; }
    main h2 { margin-top:2.5em; color:#143e78; font-size:1.65rem; border-top:1px solid var(--line); padding-top:1.4em; }
    main h3 { margin-top:1.8em; color:#245c9d; }
    p { margin:.8em 0; }
    blockquote { margin:1.3em 0; padding:12px 18px; border-left:4px solid var(--blue); background:#edf5ff; color:#294867; border-radius:0 8px 8px 0; }
    li { margin:.35em 0; }
    code { background:#eef2f7; padding:.15em .35em; border-radius:4px; }
    img { display:block; width:100%; height:auto; margin:20px auto 30px; border-radius:12px; border:1px solid #26354e; box-shadow:0 12px 30px rgba(15,30,55,.18); }
    table { width:100%; border-collapse:collapse; margin:20px 0; font-size:.95rem; }
    th,td { padding:12px; border:1px solid var(--line); text-align:left; vertical-align:top; }
    th { background:#eaf2fd; color:#153f77; }
    footer { text-align:center; color:var(--muted); padding:20px; }
    @media (max-width:700px) { main { border-radius:0; } .toolbar { padding-right:12px; } }
    @media print { body { background:#fff; font-size:11pt; } header { padding:24px 0; } .toolbar { display:none; } main { max-width:none; box-shadow:none; padding:0; margin:0; } h2 { break-before:page; } img { max-height:7.1in; object-fit:contain; break-inside:avoid; box-shadow:none; } }
  </style>
</head>
<body>
  <header><div><h1>Manual de Usuario</h1><p>ERP/CRM Óptica Paracao · versión autocontenida con capturas sanitizadas</p></div></header>
  <div class="toolbar"><button onclick="window.print()">Imprimir / Guardar PDF</button></div>
  <main>${article}</main>
  <footer>Óptica Paracao · Manual generado en agosto de 2026</footer>
</body>
</html>`;

fs.writeFileSync(outputPath, html, 'utf8');
console.log(outputPath);
