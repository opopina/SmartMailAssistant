console.log('SmartMail Assistant iniciado');

// Configuración inicial
let aiService = null;
let emailProcessor = null;

// Crear menú contextual
function createContextMenu() {
  browser.menus.create({
    id: "analyze-email",
    title: "Analizar con SmartMail",
    contexts: ["message_list"],
    visible: true
  }, () => {
    if (browser.runtime.lastError) {
      console.error('Error creando menú:', browser.runtime.lastError);
    } else {
      console.log('Menú contextual creado correctamente');
    }
  });
}

// Agregar botón de configuración
browser.menus.create({
  id: "smartmail-settings",
  title: "Configurar SmartMail Assistant",
  contexts: ["tools_menu"],
  command: "_execute_browser_action"
});

// Inicializar servicios cuando la extensión se carga
browser.runtime.onInstalled.addListener(async ({ reason, temporary }) => {
  if (temporary) console.log('Instalación temporal para desarrollo');
  
  try {
    // Crear menú contextual
    createContextMenu();
    
    // Cargar configuración
    const config = await browser.storage.local.get('apiKey');
    
    // Inicializar servicios
    aiService = new AIService({
      apiKey: config.apiKey,
      model: 'gpt-4'
    });
    
    emailProcessor = new EmailProcessor(aiService);
    
    console.log('Servicios inicializados correctamente');
  } catch (error) {
    console.error('Error inicializando servicios:', error);
  }
});

// Escuchar nuevos correos
browser.messages.onNewMailReceived.addListener(async (folder, messages) => {
  console.log('Nuevo correo recibido:', messages);
  
  try {
    for (const message of messages) {
      const analysis = await emailProcessor.processNewEmail(message.id);
      console.log('Análisis completado:', analysis);
    }
  } catch (error) {
    console.error('Error procesando nuevo correo:', error);
  }
});

// Manejar clics en el menú contextual
browser.menus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "analyze-email") {
    console.log('Menú contextual clickeado', info);
    try {
      console.log('Iniciando análisis del mensaje:', info.messageId);
      const analysis = await emailProcessor.processNewEmail(info.messageId);
      console.log('Análisis completo:', analysis);
      
      // Mostrar notificación más detallada
      browser.notifications.create({
        type: "basic",
        title: "SmartMail Assistant",
        message: `Análisis completado:\nPrioridad: ${analysis.priority}\nCategoría: ${analysis.category}\nAcciones: ${analysis.actions.join(', ')}`
      });
    } catch (error) {
      console.error('Error detallado:', error);
      // Mostrar notificación de error
      browser.notifications.create({
        type: "basic",
        title: "SmartMail Assistant - Error",
        message: `Error al analizar: ${error.message}`
      });
    }
  }
});