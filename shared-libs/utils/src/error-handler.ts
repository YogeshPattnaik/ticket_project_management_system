export class AppException extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppException';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationException extends AppException {
  constructor(message: string, details?: unknown) {
    super(400, 'VALIDATION_ERROR', message, details);
    this.name = 'ValidationException';
  }
}

export class NotFoundException extends AppException {
  constructor(resource: string, id?: string) {
    super(404, 'RESOURCE_NOT_FOUND', `${resource} not found`, { id });
    this.name = 'NotFoundException';
  }
}

export class UnauthorizedException extends AppException {
  constructor(message = 'Unauthorized') {
    super(401, 'UNAUTHORIZED', message);
    this.name = 'UnauthorizedException';
  }
}

export class ForbiddenException extends AppException {
  constructor(message = 'Forbidden') {
    super(403, 'FORBIDDEN', message);
    this.name = 'ForbiddenException';
  }
}

export class ConflictException extends AppException {
  constructor(message: string, details?: unknown) {
    super(409, 'CONFLICT', message, details);
    this.name = 'ConflictException';
  }
}

export class InternalServerException extends AppException {
  constructor(message = 'Internal server error', details?: unknown) {
    super(500, 'INTERNAL_SERVER_ERROR', message, details);
    this.name = 'InternalServerException';
  }
}

