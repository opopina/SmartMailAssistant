document.addEventListener('DOMContentLoaded', async () => {
  const currentMailInfo = document.getElementById('current-mail-info');
  const noMailSelected = document.getElementById('no-mail-selected');
  const suggestReplyBtn = document.getElementById('suggest-reply-btn');
  let currentMessage = null;
  
  try {
    // Inicializar la extensión
    const response = await browser.runtime.sendMessage({ action: "init" });
    if (response.status === "ok") {
      console.log("Extensión inicializada correctamente");
      
      // Obtener y mostrar información del correo actual
      currentMessage = await MailManager.getCurrentMessage();
      if (currentMessage) {
        const analysis = await MailManager.analyzeMessage(currentMessage);
        showMailInfo(analysis);
      } else {
        currentMailInfo.classList.add('hidden');
        noMailSelected.classList.remove('hidden');
      }
    }
  } catch (error) {
    console.error("Error:", error);
    showError(error.message);
  }

  // Event listeners para los botones
  document.getElementById('analyze-btn')?.addEventListener('click', async () => {
    try {
      const message = await MailManager.getCurrentMessage();
      if (message) {
        const analysis = await MailManager.analyzeMessage(message);
        showMailInfo(analysis);
      }
    } catch (error) {
      showError(error.message);
    }
  });

  suggestReplyBtn?.addEventListener('click', async () => {
    if (!currentMessage) {
      showError('No hay mensaje seleccionado');
      return;
    }

    try {
      suggestReplyBtn.disabled = true;
      suggestReplyBtn.textContent = 'Generando...';

      // Abrir ventana de composición con la respuesta sugerida
      await ComposeManager.openNewCompose('reply', currentMessage);

      // Cerrar popup
      window.close();
    } catch (error) {
      console.error('Error:', error);
      showError(error.message);
    } finally {
      if (suggestReplyBtn) {
        suggestReplyBtn.disabled = false;
        suggestReplyBtn.textContent = 'Sugerir Respuesta';
      }
    }
  });
});

function showMailInfo(mailInfo) {
  if (!mailInfo) return;

  const currentMailInfo = document.getElementById('current-mail-info');
  const noMailSelected = document.getElementById('no-mail-selected');
  
  document.getElementById('mail-subject').textContent = mailInfo.subject;
  document.getElementById('mail-from').textContent = mailInfo.author;
  document.getElementById('mail-priority').textContent = 
    mailInfo.priority > 1 ? 'Alta' : mailInfo.priority > 0 ? 'Media' : 'Baja';

  currentMailInfo.classList.remove('hidden');
  noMailSelected.classList.add('hidden');
}

function showError(message) {
  const statusText = document.getElementById('status-text');
  statusText.textContent = `Error: ${message}`;
  statusText.style.color = '#670000';
} 