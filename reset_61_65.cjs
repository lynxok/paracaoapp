const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'qa_report', 'qa_resultados.js');
let raw = fs.readFileSync(jsonPath, 'utf8');

// Extract JSON object
const jsonText = raw.replace('window.QA_INITIAL_DATA = ', '').replace(/;\s*$/, '');
const data = JSON.parse(jsonText);

// Reset TC-61 to TC-65 to completely blank/pending state
for (let i = 61; i <= 65; i++) {
  const key = `TC-${i}`;
  data[key] = {
    status: "",
    responsable: "",
    fecha: "",
    notas: "",
    solucion_aplicada: ""
  };
}

const updatedContent = 'window.QA_INITIAL_DATA = ' + JSON.stringify(data, null, 2) + ';\n';
fs.writeFileSync(jsonPath, updatedContent, 'utf8');
console.log('Casos TC-61 a TC-65 reseteados a estado vacio/pendiente correctamente.');
