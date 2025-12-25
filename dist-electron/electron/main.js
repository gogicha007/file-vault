"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const db_1 = require("../src/db");
let mainWindow = null;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        autoHideMenuBar: true,
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });
    // Load the app
    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools();
    }
    else {
        mainWindow.loadFile(path_1.default.join(__dirname, '../dist/index.html'));
    }
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}
// Database IPC Handlers
electron_1.ipcMain.handle('db:getPaths', async () => {
    try {
        const paths = await db_1.prisma.path.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
        });
        return { success: true, data: paths };
    }
    catch (error) {
        console.error('Failed to get paths:', error);
        return { success: false, error: 'Failed to fetch paths' };
    }
});
electron_1.ipcMain.handle('db:createPath', async (_, input) => {
    try {
        const { path, name, description, userId } = input;
        if (!path || !userId) {
            return { success: false, error: 'Path and userId are required' };
        }
        const newPath = await db_1.prisma.path.create({
            data: {
                path,
                name: name || null,
                description: description || null,
                userId,
            },
        });
        return { success: true, data: newPath };
    }
    catch (error) {
        console.error('Failed to create path:', error);
        return { success: false, error: 'Failed to create path' };
    }
});
electron_1.ipcMain.handle('db:updatePath', async (_, input) => {
    try {
        const { id, path, name, description } = input;
        if (!id) {
            return { success: false, error: 'Path ID is required' };
        }
        const updatedPath = await db_1.prisma.path.update({
            where: { id },
            data: {
                ...(path && { path }),
                ...(name !== undefined && { name }),
                ...(description !== undefined && { description }),
            },
        });
        return { success: true, data: updatedPath };
    }
    catch (error) {
        console.error('Failed to update path:', error);
        return { success: false, error: 'Failed to update path' };
    }
});
electron_1.ipcMain.handle('db:deletePath', async (_, id) => {
    try {
        if (!id) {
            return { success: false, error: 'Path ID is required' };
        }
        const deletedPath = await db_1.prisma.path.delete({
            where: { id },
        });
        return { success: true, data: deletedPath };
    }
    catch (error) {
        if (error?.code === 'P2025') {
            return { success: false, error: 'Path not found' };
        }
        console.error('Failed to delete path:', error);
        return { success: false, error: 'Failed to delete path' };
    }
});
// App lifecycle
electron_1.app.whenReady().then(createWindow);
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
// Cleanup on quit
electron_1.app.on('before-quit', async () => {
    await db_1.prisma.$disconnect();
});
