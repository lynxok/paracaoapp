const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'qa_report', 'qa_resultados.js');
let content = fs.readFileSync(filePath, 'utf8');

// Replace all responsable values or empty responsable values with NACHO
content = content.replace(/"responsable"\s*:\s*"[^"]*"/g, '"responsable": "NACHO"');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Todos los campos responsable fueron actualizados a NACHO exitosamente.');
