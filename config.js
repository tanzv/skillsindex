"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.desktopConfig = exports.DesktopConfig = exports.store = void 0;
const electron_store_1 = __importDefault(require("electron-store"));
const desktop_mcp_adapter_1 = require("./desktop-mcp-adapter");
const defaults = {
    windowBounds: {
        width: 1200,
        height: 800,
        x: undefined,
        y: undefined,
    },
    recentFiles: [],
    claudeCodeAccount: undefined,
    claudeApiKey: undefined,
    claudeLoginType: undefined,
    enabledIntegrations: desktop_mcp_adapter_1.DesktopMCPAdapter.getSupportedIntegrations(),
    codexApiKey: undefined,
    codexLoginType: undefined,
    workspaceFolders: {},
};
exports.store = new electron_store_1.default({
    defaults,
});
class DesktopConfig {
    constructor(store) {
        this.store = store;
    }
    get(key) {
        try {
            // @ts-expect-error
            return this.store.get(key);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            // Let's ignore permission issues and return default value instead.
            if (errorMessage.toLowerCase().includes("eperm")) {
                return defaults[key];
            }
            throw error;
        }
    }
    delete(key) {
        try {
            // @ts-expect-error
            this.store.delete(key);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            // Let's ignore permission issues.
            if (errorMessage.toLowerCase().includes("eperm")) {
                return;
            }
            throw error;
        }
    }
    set(key, value) {
        try {
            // @ts-expect-error
            this.store.set(key, value);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            // Let's ignore permission issues.
            if (errorMessage.toLowerCase().includes("eperm")) {
                return;
            }
            throw error;
        }
    }
}
exports.DesktopConfig = DesktopConfig;
exports.desktopConfig = new DesktopConfig(exports.store);
