const fs = require('fs');
const path = require('path');

const BACKUP_DIR = path.join(__dirname, 'BackUp de versiones');
const DIST_DIR = path.join(__dirname, 'dist');
const MAX_BACKUPS = 10;

// Get details from command line argument
const details = process.argv[2] || "Copia de seguridad generada automáticamente.";

// Ensure backup dir exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Check if dist exists
if (!fs.existsSync(DIST_DIR)) {
  console.error("Error: La carpeta 'dist' no existe. Debes ejecutar 'npm run build' primero.");
  process.exit(1);
}

// Find existing versions
const items = fs.readdirSync(BACKUP_DIR);
let maxVersion = 0;
let versionFolders = [];

items.forEach(item => {
  if (item.startsWith('Version_')) {
    const num = parseInt(item.replace('Version_', ''), 10);
    if (!isNaN(num)) {
      if (num > maxVersion) maxVersion = num;
      versionFolders.push({ name: item, num: num });
    }
  }
});

const nextVersion = maxVersion + 1;
const nextVersionDir = path.join(BACKUP_DIR, `Version_${nextVersion}`);

console.log(`Creando Backup: ${nextVersionDir}...`);

// Recursive copy function
function copyRecursiveSync(src, dest) {
  var exists = fs.existsSync(src);
  var stats = exists && fs.statSync(src);
  var isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    fs.mkdirSync(dest);
    fs.readdirSync(src).forEach(function(childItemName) {
      copyRecursiveSync(path.join(src, childItemName),
                        path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Copy dist to new version folder
copyRecursiveSync(DIST_DIR, nextVersionDir);

// Write detalles.txt
const dateStr = new Date().toLocaleString('es-AR');
const txtContent = `Versión ${nextVersion}\nFecha: ${dateStr}\n\nDetalles:\n${details}\n`;
fs.writeFileSync(path.join(nextVersionDir, 'detalles.txt'), txtContent, 'utf8');

console.log(`Backup Versión ${nextVersion} creado exitosamente.`);

// Clean up old backups (keep only MAX_BACKUPS)
versionFolders.push({ name: `Version_${nextVersion}`, num: nextVersion });
versionFolders.sort((a, b) => b.num - a.num); // Sort descending

if (versionFolders.length > MAX_BACKUPS) {
  const toDelete = versionFolders.slice(MAX_BACKUPS);
  toDelete.forEach(folder => {
    const delPath = path.join(BACKUP_DIR, folder.name);
    console.log(`Eliminando versión antigua: ${folder.name}...`);
    fs.rmSync(delPath, { recursive: true, force: true });
  });
}

console.log('Proceso de backup finalizado.');
