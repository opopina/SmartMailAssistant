var EmailProcessor = class {
  constructor(aiService) {
    this.aiService = aiService;
    this.folderStructure = {
      high: 'Alta_Prioridad',
      normal: 'Normal',
      low: 'Baja_Prioridad'
    };
  }

  async processNewEmail(messageId) {
    try {
      // Obtener el mensaje usando la API experimental
      const message = await browser.SmartMailAPI.analyzeEmail(messageId);
      
      // Extraer contenido relevante
      const emailData = this.extractEmailContent(message);
      
      // Analizar con IA
      const analysis = await this.aiService.analyzeEmailContent(emailData);
      
      // Organizar según el análisis
      await this.organizeEmail(messageId, analysis);
      
      // Guardar análisis para aprendizaje futuro
      await this.saveAnalysis(messageId, analysis);
      
      return analysis;
    } catch (error) {
      console.error('Error procesando email:', error);
      throw error;
    }
  }

  extractEmailContent(message) {
    return {
      subject: message.subject,
      from: message.author,
      body: message.body,
      date: message.date,
      recipients: message.recipients
    };
  }

  async organizeEmail(messageId, analysis) {
    const folderPath = this.getFolderPath(analysis.priority);
    await browser.SmartMailAPI.organizeMail(messageId, folderPath);
  }

  getFolderPath(priority) {
    return this.folderStructure[priority] || this.folderStructure.normal;
  }

  async saveAnalysis(messageId, analysis) {
    await browser.storage.local.set({
      [`analysis_${messageId}`]: {
        ...analysis,
        timestamp: Date.now()
      }
    });
  }
} 