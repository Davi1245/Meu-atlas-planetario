// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Funções de ficheiro existentes
  readFileSync: (relativeFilePath) => ipcRenderer.invoke('read-file', relativeFilePath),
  writeFileSync: (relativeFilePath, content) => ipcRenderer.invoke('write-file', relativeFilePath, content),
  existsSync: (relativeFilePath) => ipcRenderer.invoke('exists-file', relativeFilePath),
  mkdirSync: (relativeDirPath) => ipcRenderer.invoke('mkdir', relativeDirPath),
  
  // NOVA/MODIFICADA função para upload de MÍDIA PRINCIPAL (imagem OU vídeo)
  selectAndUploadMainMedia: () => ipcRenderer.invoke('upload-main-media-dialog')
});

console.log('[Preload] Script de preload carregado e electronAPI exposto (com selectAndUploadMainMedia).');
