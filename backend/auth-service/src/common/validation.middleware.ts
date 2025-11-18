import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
// import { validate } from 'class-validator';
// import { plainToInstance } from 'class-transformer';
// import { Logger } from '@task-management/utils';

@Injectable()
export class ValidationMiddleware implements NestMiddleware {
  // Logger available for future use
  // private readonly logger = new Logger('ValidationMiddleware');

  async use(req: Request, _res: Response, next: NextFunction): Promise<void> {
    // Basic input sanitization
    if (req.body) {
      this.sanitizeInput(req.body);
    }

    if (req.query) {
      this.sanitizeInput(req.query);
    }

    next();
  }

  private sanitizeInput(obj: any): void {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        // Remove potential XSS attempts
        obj[key] = obj[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.sanitizeInput(obj[key]);
      }
    }
  }
}
