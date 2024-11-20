class ComposeManager {
  static async openNewCompose(type = 'new', originalMessage = null) {
    try {
      if (type === 'reply' && originalMessage) {
        // Preparamos el contenido básico primero
        const senderName = originalMessage.author.split('<')[0].trim();
        
        // Usamos compose.beginReply en lugar de beginNew
        return await browser.compose.beginReply(originalMessage.id, {
          body: `Estimado/a ${senderName},\n\n[Tu respuesta aquí]\n\nSaludos cordiales,`,
          replyTo: originalMessage.author
        });
      } else {
        // Para nuevos mensajes, simplemente abrimos una ventana vacía
        return await browser.compose.beginNew();
      }
    } catch (error) {
      console.error('Error al abrir compositor:', error);
      throw new Error('No se pudo abrir el compositor');
    }
  }
} 