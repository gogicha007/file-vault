// export { }

export interface ElectronAPI {
  auth: {
    register: (email: string, password: string, name?: string) => Promise<User>
    login: (email: string, password: string) => Promise<User>
    getCurrentUser: () => Promise<User | null>
    logout: () => Promise<void>
  }
}

type User = {
  id: string
  email: string
  name: string | null
  role: string
}

declare global {
  interface Window {
    electronAPI: ElectronAPI,
    electron: {
      invoke: (channel: string, ...args: Array<any>) => Promise<any>
    }
  }
}
