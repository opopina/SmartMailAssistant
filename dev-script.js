const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

// Lee la configuración
const config = JSON.parse(fs.readFileSync('./dev-config.json', 'utf8'));

// Función para recargar la extensión
function reloadExtension() {
  console.log('Cambios detectados - Recargando extensión...');
  // Aquí puedes agregar lógica adicional para recargar
}

// Observar cambios en los archivos
chokidar.watch([
  './content/**/*',
  './background/**/*',
  './manifest.json'
]).on('change', (event, path) => {
  reloadExtension();
});

console.log('Observando cambios en el proyecto...');
