import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
// import { Logger } from '@task-management/utils';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  // Logger available for future use
  // private readonly logger = new Logger('SecurityMiddleware');

  use(req: Request, res: Response, next: NextFunction): void {
    // Helmet for security headers
    helmet()(req, res, () => {
      // Rate limiting
      const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        standardHeaders: true,
        legacyHeaders: false,
      });

      limiter(req, res, () => {
        // CORS headers
        res.header('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.header('Access-Control-Allow-Credentials', 'true');

        // XSS Protection
        res.header('X-Content-Type-Options', 'nosniff');
        res.header('X-Frame-Options', 'DENY');
        res.header('X-XSS-Protection', '1; mode=block');

        next();
      });
    });
  }
}
