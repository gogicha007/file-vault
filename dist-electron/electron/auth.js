"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.loginUser = loginUser;
exports.getCurrentUser = getCurrentUser;
exports.logoutUser = logoutUser;
exports.getAuthStoreSnapshot = getAuthStoreSnapshot;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const electron_store_1 = __importDefault(require("electron-store"));
const db_1 = require("../src/db");
const store = new electron_store_1.default({
    name: 'auth-session',
    encryptionKey: 'file-vault-secret-key'
});
async function registerUser(email, password, name) {
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    const user = await db_1.prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name
        }
    });
    store.set('userId', user.id);
    return { id: user.id, email: user.email, name: user.name, role: user.role };
}
async function loginUser(email, password) {
    const user = await db_1.prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        throw new Error('User not found');
    }
    const isValid = await bcryptjs_1.default.compare(password, user.password);
    if (!isValid) {
        throw new Error('Invalid password');
    }
    store.set('userId', user.id);
    return { id: user.id, email: user.email, name: user.name, role: user.role };
}
async function getCurrentUser() {
    const userId = store.get('userId');
    if (!userId) {
        return null;
    }
    const user = await db_1.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true, role: true }
    });
    return user;
}
function logoutUser() {
    // Delete key using set(undefined) to satisfy TS typings
    store.set('userId', undefined);
}
// Debug helper: snapshot store path and data for DevTools inspection
function getAuthStoreSnapshot() {
    const anyStore = store;
    return {
        path: anyStore.path,
        data: anyStore.store || {},
    };
}
