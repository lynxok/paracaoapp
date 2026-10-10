const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const indexPath = path.join(rootDir, 'index.html');

const sourceHtml = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Óptica Paracao</title>
    <link rel="icon" type="image/png" href="/argoslogo.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Outfit:wght@100..900&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;

try {
  const current = fs.existsSync(indexPath) ? fs.readFileSync(indexPath, 'utf8') : '';
  if (!current.includes('/src/main.tsx')) {
    fs.writeFileSync(indexPath, sourceHtml, 'utf8');
    console.log('[dev] index.html restaurado apuntando a /src/main.tsx para HMR.');
  }
} catch (e) {
  console.warn('Advertencia en ensure_dev_index:', e.message);
}
