"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.LogLevel = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "debug";
    LogLevel["INFO"] = "info";
    LogLevel["WARN"] = "warn";
    LogLevel["ERROR"] = "error";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class Logger {
    context;
    constructor(context) {
        this.context = context;
    }
    log(level, message, metadata, error) {
        const entry = {
            timestamp: new Date(),
            level,
            message,
            context: this.context,
            metadata,
            error,
        };
        const logString = JSON.stringify(entry);
        switch (level) {
            case LogLevel.DEBUG:
                console.debug(logString);
                break;
            case LogLevel.INFO:
                console.info(logString);
                break;
            case LogLevel.WARN:
                console.warn(logString);
                break;
            case LogLevel.ERROR:
                console.error(logString);
                break;
        }
    }
    debug(message, metadata) {
        this.log(LogLevel.DEBUG, message, metadata);
    }
    info(message, metadata) {
        this.log(LogLevel.INFO, message, metadata);
    }
    warn(message, metadata) {
        this.log(LogLevel.WARN, message, metadata);
    }
    error(message, error, metadata) {
        this.log(LogLevel.ERROR, message, metadata, error);
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map