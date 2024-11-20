class AIManager {
  static async generateReply(message, tone = 'professional') {
    try {
      const apiKeys = await SettingsManager.getApiKeys();
      if (!apiKeys.openai) {
        throw new Error('API Key de OpenAI no configurada');
      }

      const prompt = this.createPrompt(message, tone);
      const response = await this.callOpenAI(prompt, apiKeys.openai);
      
      return this.formatResponse(response, message);
    } catch (error) {
      console.error('Error en generación de respuesta:', error);
      throw error;
    }
  }

  static createPrompt(message, tone) {
    return `Genera una respuesta profesional para un correo electrónico con las siguientes características:
    
    Asunto: ${message.subject}
    De: ${message.author}
    Tono: ${tone}
    
    La respuesta debe:
    1. Ser cordial y profesional
    2. Mantener un tono ${tone}
    3. Ser concisa y clara
    4. Incluir un saludo apropiado y despedida
    
    Contenido original del correo:
    ${message.body || '[Contenido no disponible]'}`;
  }

  static async callOpenAI(prompt, apiKey) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Error en API de OpenAI: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  static formatResponse(aiResponse, originalMessage) {
    const senderName = originalMessage.author.split('<')[0].trim();
    
    return `Estimado/a ${senderName},\n\n${aiResponse}\n\nSaludos cordiales,`;
  }
} 