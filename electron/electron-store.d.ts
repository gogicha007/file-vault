declare module 'electron-store' {
  class Store<T = any> {
    constructor(options?: any)
    get<K extends keyof T>(key: K): T[K] | undefined
    set<K extends keyof T>(key: K, value: T[K]): void
    delete(key: keyof T): void
    clear(): void
  }
  export = Store
}