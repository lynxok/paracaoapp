const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

const sourceHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Óptica Paracó</title>
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

fs.writeFileSync(path.join(rootDir, 'index.html'), sourceHtml, 'utf8');

if (fs.existsSync(path.join(rootDir, 'assets'))) {
  fs.rmSync(path.join(rootDir, 'assets'), { recursive: true, force: true });
}
if (fs.existsSync(path.join(rootDir, 'dist'))) {
  fs.rmSync(path.join(rootDir, 'dist'), { recursive: true, force: true });
}

console.log('Building Vite production bundle...');
execSync('npx vite build --emptyOutDir', { stdio: 'inherit', cwd: rootDir });

console.log('Copying production bundle to root for Hostinger Git deployment...');
fs.cpSync(path.join(rootDir, 'dist', 'assets'), path.join(rootDir, 'assets'), { recursive: true });
fs.copyFileSync(path.join(rootDir, 'dist', 'index.html'), path.join(rootDir, 'index.html'));

console.log('Build and deployment preparation completed successfully!');
