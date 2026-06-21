/**
 * Security utilities and configuration
 * Centralizes security-related functionality including CSP, headers, and validation
 */

/**
 * Content Security Policy configuration
 */
export const CSP_DIRECTIVES = {
  // Default source for all content types
  'default-src': ["'self'"],
  
  // Script sources - be restrictive to prevent XSS
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for Vite HMR in development
    "'unsafe-eval'", // Required for development, should be removed in production
    "https://cdn.tailwindcss.com", // If using Tailwind CDN
    "https://unpkg.com", // For development tools
  ],
  
  // Style sources
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for styled-components and dynamic styles
    "https://fonts.googleapis.com",
    "https://cdn.tailwindcss.com",
  ],
  
  // Font sources
  'font-src': [
    "'self'",
    "https://fonts.gstatic.com",
    "data:", // For base64 encoded fonts
  ],
  
  // Image sources
  'img-src': [
    "'self'",
    "data:", // For base64 images
    "blob:", // For dynamically generated images
    "https:", // Allow HTTPS images from any domain
  ],
  
  // Media sources (video, audio)
  'media-src': [
    "'self'",
    "blob:",
    "data:",
  ],
  
  // Connect sources (AJAX, WebSocket, etc.)
  'connect-src': [
    "'self'",
    "https://api.convex.dev", // Convex API
    "wss://api.convex.dev", // Convex WebSocket
    "https://*.convex.cloud", // Convex deployment URLs
    "ws://localhost:*", // Development WebSocket
    "http://localhost:*", // Development API calls
  ],
  
  // Object sources (for <object>, <embed>, <applet>)
  'object-src': ["'none'"],
  
  // Base URI
  'base-uri': ["'self'"],
  
  // Form action destinations
  'form-action': ["'self'"],
  
  // Frame ancestors (who can embed this site)
  'frame-ancestors': ["'none'"],
  
  // Frame sources (what can be embedded)
  'frame-src': ["'none'"],
  
  // Worker sources
  'worker-src': ["'self'", "blob:"],
  
  // Manifest sources
  'manifest-src': ["'self'"],
};

/**
 * Generate CSP header value from directives
 */
export function generateCSPHeader(isDevelopment = false): string {
  const directives = { ...CSP_DIRECTIVES };
  
  // Remove unsafe directives in production
  if (!isDevelopment) {
    directives['script-src'] = directives['script-src'].filter(
      src => !src.includes('unsafe-eval') && !src.includes('unpkg.com')
    );
  }
  
  return Object.entries(directives)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
}

/**
 * Security headers configuration
 */
export const SECURITY_HEADERS = {
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // XSS Protection (legacy, but still good to have)
  'X-XSS-Protection': '1; mode=block',
  
  // Referrer Policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions Policy (formerly Feature Policy)
  'Permissions-Policy': [
    'geolocation=()',
    'camera=()',
    'microphone=()',
    'payment=()'
  ].join(', '),
  
  // Strict Transport Security (HTTPS only)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Cross-Origin policies
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Resource-Policy': 'cross-origin',
};

/**
 * Input sanitization utilities
 */
export class SecurityValidator {
  /**
   * Sanitize HTML input to prevent XSS
   */
  static sanitizeHtml(input: string): string {
    // Basic HTML entity encoding
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) && email.length <= 254;
  }
  
  /**
   * Validate URL format and protocol
   */
  static isValidUrl(url: string, allowedProtocols = ['https:', 'http:']): boolean {
    try {
      const urlObj = new URL(url);
      return allowedProtocols.includes(urlObj.protocol);
    } catch {
      return false;
    }
  }
  
  /**
   * Check if string contains potentially dangerous patterns
   */
  static containsDangerousPatterns(input: string): boolean {
    const dangerousPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /<object[^>]*>.*?<\/object>/gi,
      /<embed[^>]*>/gi,
    ];
    
    return dangerousPatterns.some(pattern => pattern.test(input));
  }
  
  /**
   * Validate file upload security
   */
  static validateFileUpload(file: File, allowedTypes: string[], maxSize = 5 * 1024 * 1024): {
    valid: boolean;
    error?: string;
  } {
    // Check file size
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds ${maxSize / 1024 / 1024}MB limit`
      };
    }
    
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed`
      };
    }
    
    // Check file name for dangerous patterns
    if (this.containsDangerousPatterns(file.name)) {
      return {
        valid: false,
        error: 'File name contains potentially dangerous characters'
      };
    }
    
    return { valid: true };
  }
}

/**
 * Rate limiting utilities (simple client-side implementation)
 */
export class RateLimiter {
  private static attempts = new Map<string, { count: number; resetTime: number }>();
  
  /**
   * Check if action is rate limited
   */
  static isRateLimited(key: string, maxAttempts = 5, windowMs = 60000): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);
    
    if (!record || now > record.resetTime) {
      // Reset or create new record
      this.attempts.set(key, { count: 1, resetTime: now + windowMs });
      return false;
    }
    
    if (record.count >= maxAttempts) {
      return true;
    }
    
    // Increment attempt count
    record.count++;
    return false;
  }
  
  /**
   * Reset rate limit for a key
   */
  static resetRateLimit(key: string): void {
    this.attempts.delete(key);
  }
}

/**
 * Session security utilities
 */
export class SessionSecurity {
  private static readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private static readonly ACTIVITY_KEY = 'last_activity';
  
  /**
   * Check if session is expired
   */
  static isSessionExpired(): boolean {
    const lastActivity = localStorage.getItem(this.ACTIVITY_KEY);
    if (!lastActivity) return true;
    
    const now = Date.now();
    const lastActivityTime = parseInt(lastActivity, 10);
    
    return (now - lastActivityTime) > this.SESSION_TIMEOUT;
  }
  
  /**
   * Update last activity timestamp
   */
  static updateActivity(): void {
    localStorage.setItem(this.ACTIVITY_KEY, Date.now().toString());
  }
  
  /**
   * Clear session data
   */
  static clearSession(): void {
    localStorage.removeItem(this.ACTIVITY_KEY);
    sessionStorage.clear();
  }
  
  /**
   * Initialize session monitoring
   */
  static initSessionMonitoring(): void {
    // Update activity on user interaction
    const updateActivity = () => this.updateActivity();
    
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });
    
    // Check session expiry periodically
    setInterval(() => {
      if (this.isSessionExpired()) {
        this.clearSession();
        // Dispatch custom event for session expiry
        window.dispatchEvent(new CustomEvent('session:expired'));
      }
    }, 60000); // Check every minute
  }
}

/**
 * CSRF protection utilities
 */
export class CSRFProtection {
  private static token: string | null = null;
  
  /**
   * Generate CSRF token
   */
  static generateToken(): string {
    if (!this.token) {
      // Generate a random token
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      this.token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
    return this.token;
  }
  
  /**
   * Get CSRF token for requests
   */
  static getToken(): string {
    return this.generateToken();
  }
  
  /**
   * Validate CSRF token
   */
  static validateToken(token: string): boolean {
    return token === this.token && this.token !== null;
  }
}

/**
 * Initialize all security measures
 */
export function initializeSecurity(): void {
  // Initialize session monitoring
  SessionSecurity.initSessionMonitoring();
  
  // Generate CSRF token
  CSRFProtection.generateToken();
  
  // Add security event listeners
  window.addEventListener('session:expired', () => {
    console.warn('Session expired, redirecting to login');
    window.location.href = '/auth/signin';
  });
  
  console.info('Security measures initialized');
}