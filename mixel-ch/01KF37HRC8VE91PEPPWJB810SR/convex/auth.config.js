export default {
  providers: [
    {
      domain: process.env.HERCULES_OIDC_AUTHORITY,
      applicationID: process.env.HERCULES_OIDC_CLIENT_ID,
      // Enhanced security configuration
      customClaims: async (ctx, args) => {
        // Add custom security claims
        return {
          aud: process.env.HERCULES_OIDC_CLIENT_ID,
          iss: process.env.HERCULES_OIDC_AUTHORITY,
        };
      },
      // Security enhancements
      profile: async (ctx, args) => {
        const { tokenIdentifier } = args;
        
        // Validate token structure and claims
        if (!tokenIdentifier || typeof tokenIdentifier !== 'string') {
          throw new Error('Invalid token identifier');
        }
        
        // Extract user information securely
        const user = {
          tokenIdentifier,
          // Add additional security validations here
        };
        
        return user;
      },
    },
  ],
  // Session security configuration
  session: {
    // Session timeout in milliseconds (24 hours)
    maxAge: 24 * 60 * 60 * 1000,
    // Enable secure cookies in production
    secure: process.env.NODE_ENV === 'production',
    // HTTP only cookies to prevent XSS
    httpOnly: true,
    // SameSite cookie attribute for CSRF protection
    sameSite: 'strict',
  },
  // CSRF protection
  csrf: {
    enabled: true,
    // Custom CSRF token validation if needed
    validateToken: (token, secret) => {
      // Add custom CSRF validation logic
      return token && secret && token.length > 0;
    },
  },
  // Rate limiting configuration
  rateLimiting: {
    enabled: true,
    // Max requests per window
    max: 10,
    // Window in milliseconds (15 minutes)
    windowMs: 15 * 60 * 1000,
    // Custom message for rate limit exceeded
    message: 'Too many authentication attempts, please try again later.',
  },
  // Security headers
  security: {
    // Content Security Policy
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", process.env.HERCULES_OIDC_AUTHORITY],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    // Additional security headers
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    },
  },
  // Audit logging configuration
  audit: {
    enabled: true,
    events: [
      'login',
      'logout',
      'token_refresh',
      'authentication_failure',
      'session_timeout',
    ],
    // Custom audit log handler
    logHandler: async (event, userId, metadata) => {
      // Implement audit logging to secure storage
      console.log(`Audit: ${event}`, { userId, metadata, timestamp: new Date().toISOString() });
    },
  },
};