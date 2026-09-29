const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

console.log('🚀 Iniciando despliegue a Hostinger...');

// 1. Compilación de producción
console.log('📦 1/3 Compilando aplicación con Vite...');
execSync('npm run build', { stdio: 'inherit', cwd: rootDir });

// 2. Verificar que dist existe y tiene los archivos críticos
if (!fs.existsSync(distDir) || !fs.existsSync(path.join(distDir, 'index.html'))) {
  console.error('❌ Error: La carpeta dist no existe o no contiene index.html');
  process.exit(1);
}

// 3. Obtener URL remota
const remoteUrl = execSync('git config --get remote.origin.url', { cwd: rootDir, encoding: 'utf8' }).trim();

// 4. Preparar repositorio efímero en dist para push a rama production
console.log('🌿 2/3 Preparando rama production limpia...');
const gitDir = path.join(distDir, '.git');
if (fs.existsSync(gitDir)) {
  fs.rmSync(gitDir, { recursive: true, force: true });
}

try {
  execSync('git init -b production', { cwd: distDir, stdio: 'pipe' });
  execSync(`git remote add origin ${remoteUrl}`, { cwd: distDir, stdio: 'pipe' });
  execSync('git add -A', { cwd: distDir, stdio: 'pipe' });
  const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
  execSync(`git commit -m "deploy(production): release ${dateStr} [skip ci]"`, { cwd: distDir, stdio: 'pipe' });

  // 5. Push a GitHub origin/production
  console.log('☁️  3/3 Enviando a GitHub (rama production)...');
  execSync('git push origin production --force', { cwd: distDir, stdio: 'inherit' });

  console.log('\n✅ ¡Despliegue completado con éxito!');
  console.log('🌐 Hostinger se sincronizará automáticamente desde la rama "production".');
  console.log('📁 Archivos en producción: solo dist/ (assets, index.html, .htaccess y logos).');
} finally {
  if (fs.existsSync(gitDir)) {
    fs.rmSync(gitDir, { recursive: true, force: true });
  }
}
