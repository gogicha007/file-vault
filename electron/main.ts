import { app, BrowserWindow, ipcMain, shell } from 'electron'
import path from 'path'
import { prisma } from '../src/db'
import { registerUser, loginUser, getCurrentUser, logoutUser, getAuthStoreSnapshot } from './auth'
import { handleFindFile } from '../src/api/find-file'

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.webContents.openDevTools()
  } else {
    // In production, the compiled main file lives in dist-electron/electron,
    // while the Vite build output (index.html) lives in dist at the app root.
    // __dirname === resources/app/dist-electron/electron in the packaged app.
    // So we need to go two levels up, then into dist/index.html.
    const indexPath = path.join(__dirname, '..', '..', 'dist', 'index.html')
    mainWindow.loadFile(indexPath)
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}
// Auth handlers
ipcMain.handle('auth:register', async (_, email: string, password: string, name?: string) => {
  return await registerUser(email, password, name)
})

ipcMain.handle('auth:login', async (_, email: string, password: string) => {
  return await loginUser(email, password)
})

ipcMain.handle('auth:getCurrentUser', async () => {
  return await getCurrentUser()
})

ipcMain.handle('auth:logout', async () => logoutUser())

// Debug: expose auth store snapshot (path + data)
ipcMain.handle('debug:authStore', async () => {
  return getAuthStoreSnapshot()
})

// Database IPC Handlers
ipcMain.handle('db:getPaths', async () => {
  try {
    const paths = await prisma.path.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    })
    return { success: true, data: paths }
  } catch (error) {
    console.error('Failed to get paths:', error)
    return { success: false, error: 'Failed to fetch paths' }
  }
})

ipcMain.handle('db:createPath', async (_, input) => {
  try {
    const { path, name, description, userId } = input
    if (!path || !userId) {
      return { success: false, error: 'Path and userId are required' }
    }

    const newPath = await prisma.path.create({
      data: {
        path,
        name: name || null,
        description: description || null,
        userId,
      },
    })
    return { success: true, data: newPath }
  } catch (error) {
    console.error('Failed to create path:', error)
    return { success: false, error: 'Failed to create path' }
  }
})

ipcMain.handle('db:updatePath', async (_, input) => {
  try {
    const { id, path, name, description } = input
    if (!id) {
      return { success: false, error: 'Path ID is required' }
    }

    const updatedPath = await prisma.path.update({
      where: { id },
      data: {
        ...(path && { path }),
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
      },
    })
    return { success: true, data: updatedPath }
  } catch (error) {
    console.error('Failed to update path:', error)
    return { success: false, error: 'Failed to update path' }
  }
})

ipcMain.handle('db:deletePath', async (_, id) => {
  try {
    if (!id) {
      return { success: false, error: 'Path ID is required' }
    }

    const deletedPath = await prisma.path.delete({
      where: { id },
    })
    return { success: true, data: deletedPath }
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return { success: false, error: 'Path not found' }
    }
    console.error('Failed to delete path:', error)
    return { success: false, error: 'Failed to delete path' }
  }
})

// AI-powered file search & open
ipcMain.handle('ai:find-file', async (_event, args) => {
  return await handleFindFile(args)
})

// Open external links in the user's default browser
ipcMain.handle('open-external', async (_event, url: string) => {
  if (!url) return
  await shell.openExternal(url)
})

// App lifecycle
app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

// Cleanup on quit
app.on('before-quit', async () => {
  await prisma.$disconnect()
})
