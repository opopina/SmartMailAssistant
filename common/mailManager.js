class MailManager {
  static async getCurrentMessage() {
    try {
      const tabs = await browser.tabs.query({active: true, currentWindow: true});
      const currentTab = tabs[0];
      
      if (currentTab && currentTab.mailTab) {
        const messages = await browser.messageDisplay.getDisplayedMessages(currentTab.id);
        if (messages && messages.length > 0) {
          const fullMessage = messages[0];
          // Obtener el cuerpo del mensaje
          const body = await browser.messages.getFull(fullMessage.id);
          return {
            ...fullMessage,
            body: body.parts[0].body
          };
        }
      }
      return null;
    } catch (error) {
      console.error('Error al obtener mensaje actual:', error);
      return null;
    }
  }

  static async analyzeMessage(message) {
    if (!message) return null;
    
    return {
      subject: message.subject,
      author: message.author,
      recipients: message.recipients,
      date: message.date,
      body: message.body,
      priority: await this.calculatePriority(message)
    };
  }

  static async calculatePriority(message) {
    // Implementación básica de prioridad
    const factors = {
      hasAttachments: message.attachments && message.attachments.length > 0 ? 1 : 0,
      isFromKnownSender: message.author.includes('@tudominio.com') ? 1 : 0,
      // Añadiremos más factores después
    };
    
    return Object.values(factors).reduce((a, b) => a + b, 0);
  }
} 