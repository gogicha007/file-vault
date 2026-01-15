import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
contextBridge.exposeInMainWorld('electronAPI', {
  auth: {
    register: (email: string, password: string, name?: string) =>
      ipcRenderer.invoke('auth:register', email, password, name),
    login: (email: string, password: string) =>
      ipcRenderer.invoke('auth:login', email, password),
    getCurrentUser: () =>
      ipcRenderer.invoke('auth:getCurrentUser'),
    logout: () =>
      ipcRenderer.invoke('auth:logout'),
  },
  db: {
    getPaths: () => ipcRenderer.invoke('db:getPaths'),
    createPath: (data: any) => ipcRenderer.invoke('db:createPath', data),
    updatePath: (id: string, data: any) => ipcRenderer.invoke('db:updatePath', id, data),
    deletePath: (id: string) => ipcRenderer.invoke('db:deletePath', id),
  },
  debug: {
    authStore: () => ipcRenderer.invoke('debug:authStore'),
  },
})


// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  invoke: (channel: string, ...args: any[]) => {
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
      'ai:find-file',
    ]
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args)
    }
    throw new Error(`Invalid channel: ${channel}`)
  },
})

