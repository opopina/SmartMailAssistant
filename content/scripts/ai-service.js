var AIService = class {
  constructor(config = {}) {
    this.apiKey = config.apiKey;
    this.model = config.model || 'gpt-4';
    this.baseUrl = config.model.includes('gpt') 
      ? 'https://api.openai.com/v1'
      : 'https://api.anthropic.com/v1';
  }

  async analyzeEmailContent(emailData) {
    try {
      const prompt = this.createAnalysisPrompt(emailData);
      const response = await this.callAIService(prompt);
      return this.parseAIResponse(response);
    } catch (error) {
      console.error('Error en análisis de correo:', error);
      throw error;
    }
  }

  createAnalysisPrompt(emailData) {
    return {
      messages: [{
        role: 'system',
        content: `Analiza el siguiente correo electrónico y determina:
          1. Prioridad (alta/media/baja)
          2. Categoría (trabajo, personal, promoción, etc.)
          3. Acciones requeridas
          4. Sugerencia de respuesta (si es necesario)`
      }, {
        role: 'user',
        content: `
          Asunto: ${emailData.subject}
          De: ${emailData.from}
          Contenido: ${emailData.body}
        `
      }]
    };
  }

  async callAIService(prompt) {
    const endpoint = this.model.includes('gpt') ? '/chat/completions' : '/messages';
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        ...prompt
      })
    });

    if (!response.ok) {
      throw new Error(`Error en la API: ${response.statusText}`);
    }

    return await response.json();
  }

  parseAIResponse(response) {
    // Procesar la respuesta de la IA
    const analysis = {
      priority: 'normal',
      category: 'general',
      actions: [],
      suggestedReply: null
    };

    try {
      const content = response.choices[0].message.content;
      // Aquí implementaremos el parsing de la respuesta
      // Por ahora retornamos un análisis básico
      return analysis;
    } catch (error) {
      console.error('Error parseando respuesta:', error);
      return analysis;
    }
  }
} 