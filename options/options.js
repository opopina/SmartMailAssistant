document.addEventListener('DOMContentLoaded', async () => {
  const openaiKeyInput = document.getElementById('openai-key');
  const claudeKeyInput = document.getElementById('claude-key');
  const saveButton = document.getElementById('save-settings');

  // Cargar configuración existente
  try {
    const apiKeys = await SettingsManager.getApiKeys();
    openaiKeyInput.value = apiKeys.openai;
    claudeKeyInput.value = apiKeys.claude;
  } catch (error) {
    showMessage('Error al cargar la configuración', 'error');
  }

  // Manejar guardado de configuración
  saveButton.addEventListener('click', async () => {
    try {
      await SettingsManager.saveApiKeys({
        openai: openaiKeyInput.value.trim(),
        claude: claudeKeyInput.value.trim()
      });
      
      showMessage('Configuración guardada correctamente', 'success');
      
      // Notificar al background script
      browser.runtime.sendMessage({
        action: "configUpdated"
      });
    } catch (error) {
      showMessage('Error al guardar la configuración', 'error');
    }
  });
});

function showMessage(text, type) {
  // Eliminar mensaje anterior si existe
  const existingMessage = document.querySelector('.message');
  if (existingMessage) {
    existingMessage.remove();
  }

  // Crear nuevo mensaje
  const message = document.createElement('div');
  message.className = `message ${type}`;
  message.textContent = text;

  // Insertar después del botón
  const saveButton = document.getElementById('save-settings');
  saveButton.parentNode.insertBefore(message, saveButton.nextSibling);

  // Eliminar mensaje después de 3 segundos
  setTimeout(() => message.remove(), 3000);
} 