console.log('SmartMail Assistant iniciado');

// Estado global de la extensión
let config = {
  apiKeys: null,
  initialized: false
};

// Cargar configuración al inicio
async function loadConfig() {
  try {
    config.apiKeys = await SettingsManager.getApiKeys();
    config.initialized = true;
    console.log('Configuración cargada correctamente');
  } catch (error) {
    console.error('Error al cargar la configuración:', error);
  }
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    switch (message.action) {
      case "init":
        console.log("Inicialización solicitada");
        sendResponse({ 
          status: "ok",
          configured: config.initialized && config.apiKeys.openai && config.apiKeys.claude
        });
        return true;

      case "configUpdated":
        console.log("Actualización de configuración detectada");
        loadConfig();
        return true;

      default:
        console.log("Acción no reconocida:", message.action);
        return false;
    }
  } catch (error) {
    console.error("Error en el listener:", error);
    sendResponse({ status: "error", message: error.message });
    return true;
  }
});

// Cargar configuración cuando se instala o actualiza la extensión
browser.runtime.onInstalled.addListener(() => {
  console.log("Extensión instalada correctamente");
  loadConfig();
});

// Cargar configuración al inicio
loadConfig(); 