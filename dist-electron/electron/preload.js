"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Expose protected methods that allow the renderer process to use
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    auth: {
        register: (email, password, name) => electron_1.ipcRenderer.invoke('auth:register', email, password, name),
        login: (email, password) => electron_1.ipcRenderer.invoke('auth:login', email, password),
        getCurrentUser: () => electron_1.ipcRenderer.invoke('auth:getCurrentUser'),
        logout: () => electron_1.ipcRenderer.invoke('auth:logout'),
    },
    db: {
        getPaths: () => electron_1.ipcRenderer.invoke('db:getPaths'),
        createPath: (data) => electron_1.ipcRenderer.invoke('db:createPath', data),
        updatePath: (id, data) => electron_1.ipcRenderer.invoke('db:updatePath', id, data),
        deletePath: (id) => electron_1.ipcRenderer.invoke('db:deletePath', id),
    },
    debug: {
        authStore: () => electron_1.ipcRenderer.invoke('debug:authStore'),
    },
});
// the ipcRenderer without exposing the entire object
electron_1.contextBridge.exposeInMainWorld('electron', {
    invoke: (channel, ...args) => {
        const validChannels = [
            'db:getPaths',
            'db:createPath',
            'db:updatePath',
            'db:deletePath',
            'auth:register',
            'auth:login',
            'auth:getCurrentUser',
            'auth:logout',
            'debug:authStore',
        ];
        if (validChannels.includes(channel)) {
            return electron_1.ipcRenderer.invoke(channel, ...args);
        }
        throw new Error(`Invalid channel: ${channel}`);
    },
});
