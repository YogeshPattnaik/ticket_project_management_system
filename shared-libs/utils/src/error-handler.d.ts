export declare class AppException extends Error {
    statusCode: number;
    code: string;
    details?: unknown | undefined;
    constructor(statusCode: number, code: string, message: string, details?: unknown | undefined);
}
export declare class ValidationException extends AppException {
    constructor(message: string, details?: unknown);
}
export declare class NotFoundException extends AppException {
    constructor(resource: string, id?: string);
}
export declare class UnauthorizedException extends AppException {
    constructor(message?: string);
}
export declare class ForbiddenException extends AppException {
    constructor(message?: string);
}
export declare class ConflictException extends AppException {
    constructor(message: string, details?: unknown);
}
export declare class InternalServerException extends AppException {
    constructor(message?: string, details?: unknown);
}
//# sourceMappingURL=error-handler.d.ts.map