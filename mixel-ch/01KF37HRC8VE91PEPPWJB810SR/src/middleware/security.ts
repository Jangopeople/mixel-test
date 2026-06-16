import type { NextFunction, Request, Response } from 'express';

// Security middleware types
interface SecurityConfig {
  rateLimit?: {
    windowMs: number;
    max: number;
    message: string;
  };
  cors?: {
    origin: string | string[];
    credentials: boolean;
    methods: string[];
  };
  headers?: Record<string, string>;
}

// Rate limiting store (in-memory for simplicity - use Redis in production)
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Helper function to get client IP
function getClientIP(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    '127.0.0.1'
  );
}

// Rate limiting middleware
export function rateLimit(config: SecurityConfig['rateLimit']) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!config) {
      return next();
    }

    const clientIP = getClientIP(req);
    const now = Date.now();
    const key = `rate_limit_${clientIP}`;
    
    const entry = rateLimitStore.get(key);
    
    if (!entry || now > entry.resetTime) {
      // Reset or create new entry
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return next();
    }
    
    if (entry.count >= config.max) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: config.message,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
      });
    }
    
    entry.count++;
    rateLimitStore.set(key, entry);
    
    // Set rate limit headers
    res.set({
      'X-RateLimit-Limit': config.max.toString(),
      'X-RateLimit-Remaining': (config.max - entry.count).toString(),
      'X-RateLimit-Reset': entry.resetTime.toString(),
    });
    
    next();
  };
}

// Security headers middleware
export function securityHeaders(config?: SecurityConfig['headers']) {
  const defaultHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  };

  const headers = { ...defaultHeaders, ...config };

  return (req: Request, res: Response, next: NextFunction) => {
    Object.entries(headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    next();
  };
}

// CORS middleware
export function cors(config?: SecurityConfig['cors']) {
  const defaultConfig = {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://mixel.ch', 'https://www.mixel.ch']
      : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  };

  const corsConfig = { ...defaultConfig, ...config };

  return (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    
    if (Array.isArray(corsConfig.origin)) {
      if (origin && corsConfig.origin.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }
    } else if (corsConfig.origin === '*' || origin === corsConfig.origin) {
      res.setHeader('Access-Control-Allow-Origin', corsConfig.origin);
    }

    if (corsConfig.credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    res.setHeader('Access-Control-Allow-Methods', corsConfig.methods.join(', '));
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-CSRF-Token'
    );

    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    next();
  };
}

// Authentication middleware
export function requireAuth() {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.replace('Bearer ', '') ||
                  req.cookies?.auth_token;

    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication token required',
      });
    }

    // Validate token format
    if (typeof token !== 'string' || token.length < 10) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid authentication token format',
      });
    }

    // Add token to request for downstream use
    (req as any).authToken = token;
    next();
  };
}

// Input validation middleware
export function validateInput(schema: Record<string, any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { body } = req;
    const errors: string[] = [];

    Object.entries(schema).forEach(([field, rules]) => {
      const value = body[field];
      
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        return;
      }

      if (value !== undefined && value !== null && value !== '') {
        if (rules.type && typeof value !== rules.type) {
          errors.push(`${field} must be of type ${rules.type}`);
        }

        if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
          errors.push(`${field} must be at least ${rules.minLength} characters`);
        }

        if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
          errors.push(`${field} must not exceed ${rules.maxLength} characters`);
        }

        if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
          errors.push(`${field} format is invalid`);
        }

        if (rules.sanitize && typeof value === 'string') {
          // Basic HTML sanitization
          body[field] = value
            .replace(/<script[^>]*>.*?<\/script>/gi, '')
            .replace(/<[^>]*>/g, '')
            .trim();
        }
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validation Error',
        messages: errors,
      });
    }

    next();
  };
}

// CSRF protection middleware
export function csrfProtection() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip CSRF for GET requests
    if (req.method === 'GET') {
      return next();
    }

    const csrfToken = req.headers['x-csrf-token'] || req.body._csrf;
    const sessionCsrf = req.session?.csrfToken;

    if (!csrfToken || !sessionCsrf || csrfToken !== sessionCsrf) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Invalid CSRF token',
      });
    }

    next();
  };
}

// Audit logging middleware
export function auditLog() {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const clientIP = getClientIP(req);
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const userId = (req as any).userId || 'anonymous';

    // Log request
    console.log('Audit Log - Request:', {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      clientIP,
      userAgent,
      userId,
    });

    // Override res.json to log response
    const originalJson = res.json;
    res.json = function(data: any) {
      const duration = Date.now() - startTime;
      
      console.log('Audit Log - Response:', {
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
        clientIP,
        userId,
      });

      return originalJson.call(this, data);
    };

    next();
  };
}

// Comprehensive security middleware factory
export function createSecurityMiddleware(config: SecurityConfig = {}) {
  return {
    rateLimit: rateLimit(config.rateLimit),
    securityHeaders: securityHeaders(config.headers),
    cors: cors(config.cors),
    requireAuth: requireAuth(),
    validateInput,
    csrfProtection: csrfProtection(),
    auditLog: auditLog(),
  };
}

// Default security configuration
export const defaultSecurityConfig: SecurityConfig = {
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
  },
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? ['https://mixel.ch', 'https://www.mixel.ch']
      : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  },
  headers: {
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self';",
  },
};

// Export middleware for easy use
export const security = createSecurityMiddleware(defaultSecurityConfig);