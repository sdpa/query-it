import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import * as dbHandlerFactory from '../backend/db/dbHandlerFactory'
import { MetadataServiceFactory } from '../backend/services/metadata/MetadataServiceFactory'
import { DatabaseType } from 'src/backend/db/types'
// import { updateMetadataFile } from './metadataFileService' // Import the new service function

let currentHandler: any = null
let currentDbType: DatabaseType | null = null // Default to PostgreSQL
let currentCredentials: any = null

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.webContents.openDevTools();

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))  
  ipcMain.handle('connect-to-database', async (_e, dbType, credentials) => {
    const handler = dbHandlerFactory.getHandler(dbType)
    const result = await handler.connect(credentials)

    if (result.success) {
      currentHandler = handler
      currentDbType = dbType as DatabaseType
      currentCredentials = credentials
    }
    return result
  })
  ipcMain.handle('disconnect-from-database', async () => {
    try {
      await currentHandler.disconnect()
      currentHandler = null
      currentDbType = null
      currentCredentials = null
      return { success: true }
    } catch (err) {
      return { success: false, message: err instanceof Error ? err.message : 'Unknown error' }
    }
  })

  ipcMain.handle('get-metadata', async () => {
    if (!currentHandler) return { error: 'Not connected' }
    const service = MetadataServiceFactory.create(currentDbType!, currentHandler)
    const metadata = await service.getMetadata()
    return metadata
  })

  // ipcMain.handle('update-metadata-file', async (_event, metadata) => {
  //   try {
  //     return await updateMetadataFile(metadata)
  //   } catch (error) {
  //     console.error('Error in update-metadata-file handler:', error)
  //     const message = error instanceof Error ? error.message : 'An unknown error occurred'
  //     // Ensure a consistent error object structure for the renderer
  //     return { success: false, error: `IPC Error: ${message}` }
  //   }
  // })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  app.on('before-quit', async () => {
    await currentHandler?.disconnect();
  })

})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
