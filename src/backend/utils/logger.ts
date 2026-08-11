import fs from "node:fs";
import path from "node:path";

const logsDir = path.resolve("logs");
const logFile = path.join(logsDir, "server.log");

fs.mkdirSync(logsDir, { recursive: true });

type LogLevel = "info" | "warn" | "error";

interface LogData {
    [key: string]: unknown;
}

function writeLog(level: LogLevel, event: string, data: LogData = {}) {
    const entry = {
        timestamp: new Date().toISOString(),
        level,
        event,
        ...data
    };

    fs.appendFileSync(
        logFile,
        JSON.stringify(entry) + "\n"
    );
}

export const logger = {
    info: (event: string, data?: LogData) =>
        writeLog("info", event, data),

    warn: (event: string, data?: LogData) =>
        writeLog("warn", event, data),

    error: (event: string, data?: LogData) =>
        writeLog("error", event, data)
};