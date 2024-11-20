"use strict";

ChromeUtils.defineModuleGetter(this, "MailServices",
  "resource:///modules/MailServices.jsm");

var SmartMailAPI = class extends ExtensionCommon.ExtensionAPI {
  getAPI(context) {
    const EventManager = ExtensionCommon.EventManager;

    return {
      SmartMailAPI: {
        // Evento para nuevos correos
        onNewMailReceived: new EventManager({
          context,
          name: "SmartMailAPI.onNewMailReceived",
          register: (fire) => {
            const listener = (folder, messages) => {
              fire.async(folder, messages);
            };
            
            MailServices.mfn.addListener(listener, MailServices.mfn.msgAdded);
            
            return () => {
              MailServices.mfn.removeListener(listener);
            };
          }
        }).api(),

        async analyzeEmail(messageId) {
          try {
            // Obtener el mensaje usando la API de Thunderbird
            const msgHdr = context.extension.messageManager.get(messageId);
            if (!msgHdr) {
              throw new Error('Mensaje no encontrado');
            }

            // Obtener el contenido del mensaje
            const content = await this.getMessageContent(msgHdr);

            return {
              subject: msgHdr.subject,
              author: msgHdr.author,
              recipients: msgHdr.recipients,
              body: content,
              date: new Date(msgHdr.dateInSeconds * 1000)
            };
          } catch (error) {
            console.error("Error analizando email:", error);
            throw error;
          }
        },

        async organizeMail(messageId, folderPath) {
          try {
            const msgHdr = context.extension.messageManager.get(messageId);
            if (!msgHdr) {
              throw new Error('Mensaje no encontrado');
            }

            // Obtener o crear la carpeta destino
            const folder = await this.getOrCreateFolder(folderPath);
            
            // Mover el mensaje
            msgHdr.folder.copyMessages(folder, [msgHdr], true, null, null);
            return true;
          } catch (error) {
            console.error("Error organizando email:", error);
            throw error;
          }
        },

        // Método auxiliar para obtener el contenido del mensaje
        async getMessageContent(msgHdr) {
          return new Promise((resolve, reject) => {
            const msgUri = msgHdr.folder.getUriForMsg(msgHdr);
            const messenger = Cc["@mozilla.org/messenger;1"].createInstance(Ci.nsIMessenger);
            const streamListener = {
              content: "",
              onStartRequest: function(request) {},
              onStopRequest: function(request, status) {
                resolve(this.content);
              },
              onDataAvailable: function(request, inputStream, offset, count) {
                const stream = Cc["@mozilla.org/scriptableinputstream;1"]
                  .createInstance(Ci.nsIScriptableInputStream);
                stream.init(inputStream);
                this.content += stream.read(count);
              }
            };
            messenger.messageServiceFromURI(msgUri)
              .streamMessage(msgUri, streamListener, null, null, false, "");
          });
        },

        // Método auxiliar para obtener o crear carpeta
        async getOrCreateFolder(folderPath) {
          const rootFolder = MailServices.accounts.localFoldersServer.rootFolder;
          let folder = rootFolder;

          const pathParts = folderPath.split('/');
          for (const part of pathParts) {
            let subFolder = folder.getChildNamed(part);
            if (!subFolder) {
              subFolder = folder.createSubfolder(part, null);
            }
            folder = subFolder;
          }

          return folder;
        }
      }
    };
  }
}; 