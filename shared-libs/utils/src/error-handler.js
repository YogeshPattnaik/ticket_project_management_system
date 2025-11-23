"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerException = exports.ConflictException = exports.ForbiddenException = exports.UnauthorizedException = exports.NotFoundException = exports.ValidationException = exports.AppException = void 0;
class AppException extends Error {
    statusCode;
    code;
    details;
    constructor(statusCode, code, message, details) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.name = 'AppException';
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppException = AppException;
class ValidationException extends AppException {
    constructor(message, details) {
        super(400, 'VALIDATION_ERROR', message, details);
        this.name = 'ValidationException';
    }
}
exports.ValidationException = ValidationException;
class NotFoundException extends AppException {
    constructor(resource, id) {
        super(404, 'RESOURCE_NOT_FOUND', `${resource} not found`, { id });
        this.name = 'NotFoundException';
    }
}
exports.NotFoundException = NotFoundException;
class UnauthorizedException extends AppException {
    constructor(message = 'Unauthorized') {
        super(401, 'UNAUTHORIZED', message);
        this.name = 'UnauthorizedException';
    }
}
exports.UnauthorizedException = UnauthorizedException;
class ForbiddenException extends AppException {
    constructor(message = 'Forbidden') {
        super(403, 'FORBIDDEN', message);
        this.name = 'ForbiddenException';
    }
}
exports.ForbiddenException = ForbiddenException;
class ConflictException extends AppException {
    constructor(message, details) {
        super(409, 'CONFLICT', message, details);
        this.name = 'ConflictException';
    }
}
exports.ConflictException = ConflictException;
class InternalServerException extends AppException {
    constructor(message = 'Internal server error', details) {
        super(500, 'INTERNAL_SERVER_ERROR', message, details);
        this.name = 'InternalServerException';
    }
}
exports.InternalServerException = InternalServerException;
//# sourceMappingURL=error-handler.js.map