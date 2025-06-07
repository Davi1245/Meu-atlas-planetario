// main.js

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

const PROJECT_ROOT = __dirname; 
const DATA_FILE_PATH_MAIN = path.join(PROJECT_ROOT, 'data.json');
const MEDIA_DIR_PATH_MAIN = path.join(PROJECT_ROOT, 'media');


function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), 
      contextIsolation: true, 
      nodeIntegration: false, 
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// --- IPC Handlers ---
ipcMain.handle('read-file', async (event, relativeFilePath) => {
  const filePath = path.join(PROJECT_ROOT, relativeFilePath);
  console.log(`[Main IPC] Lendo ficheiro: ${filePath}`);
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (err) {
    console.error('[Main IPC] Erro ao ler ficheiro:', filePath, err.message);
    return null; 
  }
});

ipcMain.handle('write-file', async (event, relativeFilePath, content) => {
  const filePath = path.join(PROJECT_ROOT, relativeFilePath);
  console.log(`[Main IPC] Escrevendo ficheiro: ${filePath}`);
  try {
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  } catch (err) {
    console.error('[Main IPC] Erro ao escrever ficheiro:', filePath, err.message);
    return false;
  }
});

ipcMain.handle('exists-file', async (event, relativeFilePath) => {
  const filePath = path.join(PROJECT_ROOT, relativeFilePath);
  return fs.existsSync(filePath);
});

ipcMain.handle('mkdir', async (event, relativeDirPath) => {
  const dirPath = path.join(PROJECT_ROOT, relativeDirPath);
  try {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
    return true;
  } catch (err) {
    console.error('[Main IPC] Erro ao criar diretório:', dirPath, err.message);
    return false;
  }
});

// NOVO/MODIFICADO: IPC Handler para lidar com o upload de MÍDIA PRINCIPAL (imagem OU vídeo)
ipcMain.handle('upload-main-media-dialog', async (event) => {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (!focusedWindow) {
    console.warn('[Main IPC] Nenhuma janela focada para mostrar o diálogo.');
    return { error: "Nenhuma janela ativa para o diálogo.", relativePath: null, originalName: null, mediaType: null };
  }

  const { canceled, filePaths } = await dialog.showOpenDialog(focusedWindow, {
    title: 'Selecione a Mídia Principal',
    filters: [
      { name: 'Imagens', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] },
      { name: 'Vídeos', extensions: ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'] } // Adicionado mais formatos de vídeo
    ],
    properties: ['openFile']
  });

  if (canceled || !filePaths || filePaths.length === 0) {
    console.log('[Main IPC] Seleção de mídia cancelada ou nenhum ficheiro selecionado.');
    return { error: null, relativePath: null, originalName: null, mediaType: null };
  }

  const originalFilePath = filePaths[0];
  const originalFileName = path.basename(originalFilePath);
  const fileExtension = path.extname(originalFileName).toLowerCase();
  let mediaType = null;

  // Determina o tipo de mídia pela extensão
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];

  if (imageExtensions.includes(fileExtension)) {
    mediaType = 'image';
  } else if (videoExtensions.includes(fileExtension)) {
    mediaType = 'video';
  } else {
    console.warn(`[Main IPC] Tipo de ficheiro não suportado: ${originalFileName}`);
    return { error: `Tipo de ficheiro não suportado: ${fileExtension}`, relativePath: null, originalName: originalFileName, mediaType: null };
  }

  console.log(`[Main IPC] Ficheiro de mídia selecionado: ${originalFilePath}, Tipo: ${mediaType}`);

  try {
    if (!fs.existsSync(MEDIA_DIR_PATH_MAIN)) {
      fs.mkdirSync(MEDIA_DIR_PATH_MAIN, { recursive: true });
      console.log(`[Main IPC] Pasta de mídia criada em: ${MEDIA_DIR_PATH_MAIN}`);
    }
  
    const safeBaseName = originalFileName.substring(0, originalFileName.length - fileExtension.length)
                                   .replace(/[^a-zA-Z0-9_.-]/g, '_');
    const uniqueFileName = `${Date.now()}_${mediaType}_${safeBaseName}${fileExtension}`;
    const destinationPathAbsolute = path.join(MEDIA_DIR_PATH_MAIN, uniqueFileName);

    fs.copyFileSync(originalFilePath, destinationPathAbsolute);

    const relativePath = `media/${uniqueFileName}`; 
    console.log(`[Main IPC] Mídia ${originalFileName} copiada para ${destinationPathAbsolute}. Caminho relativo: ${relativePath}`);
    return { error: null, relativePath: relativePath, originalName: originalFileName, mediaType: mediaType };
  } catch (error) {
    console.error("[Main IPC] Erro ao processar upload de mídia após diálogo:", error);
    return { error: error.message, relativePath: null, originalName: originalFileName, mediaType: mediaType };
  }
});