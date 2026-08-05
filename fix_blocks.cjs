const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'qa_report', 'qa_interactivo.html');
let content = fs.readFileSync(htmlPath, 'utf8');

// Update BLOCKS array to include Block L with TC-61 to TC-65
const oldBlocks = `  {id:'K',name:'Integración Avanzada — Nuevos Casos',icon:'🆕',cases:['TC-41','TC-42','TC-43','TC-44','TC-45','TC-46','TC-47','TC-48','TC-49','TC-50','TC-51','TC-52','TC-53','TC-54','TC-55','TC-56','TC-57','TC-58','TC-59','TC-60']},`;
const newBlocks = `  {id:'K',name:'Integración Avanzada — Nuevos Casos',icon:'🆕',cases:['TC-41','TC-42','TC-43','TC-44','TC-45','TC-46','TC-47','TC-48','TC-49','TC-50','TC-51','TC-52','TC-53','TC-54','TC-55','TC-56','TC-57','TC-58','TC-59','TC-60']},
  {id:'L',name:'Calidad, Staging & Automatización',icon:'🚀',cases:['TC-61','TC-62','TC-63','TC-64','TC-65']},`;

content = content.replace(oldBlocks, newBlocks);
fs.writeFileSync(htmlPath, content, 'utf8');
console.log('Bloque L (TC-61 a TC-65) agregado al menu de navegacion del HTML.');
