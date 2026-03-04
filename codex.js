"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCodexPackagePath = getCodexPackagePath;
exports.getCodexStatusChecker = getCodexStatusChecker;
const node_path_1 = __importDefault(require("node:path"));
const agent_1 = require("@ha/agent");
const electron_1 = require("electron");
const config_1 = require("./config");
function getCodexPackagePath() {
    if (!electron_1.app.isPackaged) {
        return undefined;
    }
    const appPath = electron_1.app.getAppPath();
    const asarUnpackedPath = appPath.replace(/\.asar$/, ".asar.unpacked");
    return node_path_1.default.join(asarUnpackedPath, "node_modules", "@openai", "codex-sdk");
}
function getCodexStatusChecker(ipcDeviceManager, logger) {
    let codex;
    let pollInterval;
    const hasStoredCredentials = () => {
        const loginType = config_1.desktopConfig.get("codexLoginType");
        if (!loginType) {
            return false;
        }
        return loginType === "api-key" && Boolean(config_1.desktopConfig.get("codexApiKey"));
    };
    const isSubscriptionLogin = () => {
        const loginType = config_1.desktopConfig.get("codexLoginType");
        if (!loginType) {
            return false;
        }
        return loginType === "subscription";
    };
    const notifyStatus = (status) => {
        ipcDeviceManager.notifyAll("codex-status", Object.assign(Object.assign({}, status), { loginType: config_1.desktopConfig.get("codexLoginType"), apiKeyStored: hasStoredCredentials() }));
    };
    const init = () => {
        codex === null || codex === void 0 ? void 0 : codex.destroy();
        codex = new agent_1.CodexAgent({
            logger,
            packagePath: getCodexPackagePath(),
            cwd: process.cwd(),
        });
    };
    const clearCredentials = () => {
        config_1.desktopConfig.delete("codexApiKey");
        config_1.desktopConfig.delete("codexLoginType");
    };
    const check = async () => {
        if (!codex)
            return;
        logger.debug("Checking for Codex status");
        if (pollInterval) {
            clearInterval(pollInterval);
        }
        if (hasStoredCredentials()) {
            logger.debug("API login detected for Codex, treating as logged in");
            notifyStatus({
                loggedIn: true,
            });
            return;
        }
        const status = await codex.getAgentStatus();
        notifyStatus(status);
        logger.debug("Checked for Codex status");
        if (status.loggedIn) {
            if (status.loginType) {
                config_1.desktopConfig.set("codexLoginType", status.loginType);
            }
        }
        else {
            clearCredentials();
            pollInterval = setInterval(async () => {
                if (!codex) {
                    logger.debug("Stopping Codex status check");
                    clearInterval(pollInterval);
                    return;
                }
                if (hasStoredCredentials()) {
                    logger.debug("API login detected for Codex, treating as logged in");
                    notifyStatus({
                        loggedIn: true,
                    });
                    return;
                }
                logger.debug("Polling for Codex status");
                const status = await codex.getAgentStatus();
                if (status.loggedIn) {
                    if (status.loginType) {
                        config_1.desktopConfig.set("codexLoginType", status.loginType);
                    }
                    clearInterval(pollInterval);
                }
                notifyStatus(status);
            }, 60 * 1000);
        }
    };
    init();
    return {
        checkStatus: check,
        refreshStatus: () => {
            // Check if we have stored third-party credentials
            if (hasStoredCredentials() || isSubscriptionLogin()) {
                logger.debug("Codex login was already configured");
                notifyStatus({
                    loggedIn: true,
                });
            }
            else {
                check();
            }
        },
        connect: ({ loginType, apiKey, }) => {
            config_1.desktopConfig.set("codexLoginType", loginType);
            if (loginType === "api-key" && apiKey) {
                config_1.desktopConfig.set("codexApiKey", apiKey);
            }
            init();
            check();
        },
        disconnect: () => {
            clearCredentials();
            init();
            check();
        },
        dispose: () => {
            codex === null || codex === void 0 ? void 0 : codex.destroy();
        },
    };
}
