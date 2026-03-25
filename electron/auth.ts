import bcrypt from 'bcryptjs'
import Store from 'electron-store'
import { prisma } from '../src/db'

interface AuthStore {
    userId?: string
}

const store = new Store<AuthStore>({
    name: 'auth-session',
    encryptionKey: 'file-vault-secret-key'
})

export async function registerUser(email: string, password: string, name?: string) {
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name
        }
    })

    store.set('userId', user.id)

    return { id: user.id, email: user.email, name: user.name, role: user.role }
}

export async function loginUser(email: string, password: string) {
    const user = await prisma.user.findUnique({
        where: { email },
    })

    if (!user) {
        throw new Error('User not found')
    }

    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
        throw new Error('Invalid password')
    }

    store.set('userId', user.id)

    return { id: user.id, email: user.email, name: user.name, role: user.role }
}

export async function getCurrentUser() {
    const userId = store.get('userId')

    if (!userId) {
        return null
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true, role: true }

    })

    return user
}

export function logoutUser() {
    store.delete('userId')
}

// Debug helper: snapshot store path and data for DevTools inspection
export function getAuthStoreSnapshot() {
    type InternalAuthStore = Store<AuthStore> & {
        path: string
        store: Record<string, unknown>
    }

    const internalStore = store as InternalAuthStore
    return {
        path: internalStore.path,
        data: internalStore.store,
    }
}