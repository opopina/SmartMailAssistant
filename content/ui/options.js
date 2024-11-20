document.addEventListener('DOMContentLoaded', async () => {
  // Cargar configuración guardada
  const config = await browser.storage.local.get(['apiKey', 'model']);
  if (config.apiKey) {
    document.getElementById('apiKey').value = config.apiKey;
  }
  if (config.model) {
    document.getElementById('model').value = config.model;
  }

  // Guardar configuración
  document.getElementById('save').addEventListener('click', async () => {
    const apiKey = document.getElementById('apiKey').value;
    const model = document.getElementById('model').value;
    const status = document.getElementById('status');

    try {
      await browser.storage.local.set({ apiKey, model });
      status.textContent = 'Configuración guardada correctamente';
      status.className = 'status success';
    } catch (error) {
      status.textContent = 'Error guardando la configuración: ' + error.message;
      status.className = 'status error';
    }
  });
}); 