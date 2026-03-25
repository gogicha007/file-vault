declare module 'electron-store' {
  class Store<T = any> {
    constructor(options?: Record<string, unknown>)
    get<TKey extends keyof T>(key: K): T[Tkey] | undefined
    set<TKey extends keyof T>(key: K, value: T[TKey]): void
    delete(key: keyof T): void
    clear(): void
  }
  export = Store
}