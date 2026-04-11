export default {
  providers: [
    {
      domain: process.env.HERCULES_OIDC_AUTHORITY,
      applicationID: process.env.HERCULES_OIDC_CLIENT_ID,
      // Enhanced security configuration
      scope: "openid profile email",
      responseType: "code",
      prompt: "consent",
      // Security headers and validation
      validateIssuer: true,
      clockTolerance: 60, // 60 seconds clock skew tolerance
      // Session security
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
      refreshTokenRotation: true,
      // PKCE for added security
      usePKCE: true,
    },
  ],
  // Global security settings
  session: {
    // Secure cookie settings
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 30 * 60 * 1000, // 30 minutes
    },
    // Session validation
    rolling: true, // Extend session on activity
    absoluteTimeout: 8 * 60 * 60 * 1000, // 8 hours absolute timeout
  },
  // Security callbacks
  callbacks: {
    async signIn({ user, account, profile }) {
      // Additional security checks can be added here
      // For example: user role validation, IP restrictions, etc.
      
      // Log successful authentication (without sensitive data)
      console.info(`User authentication successful: ${user?.email || 'unknown'}`);
      
      // Perform any additional validation
      if (!user?.email) {
        console.warn('Authentication attempt without email');
        return false;
      }
      
      return true;
    },
    
    async session({ session, token }) {
      // Enhance session with security information
      if (session?.user) {
        session.user.lastLogin = new Date().toISOString();
        session.security = {
          sessionStart: token?.iat || Math.floor(Date.now() / 1000),
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
        };
      }
      return session;
    },
    
    async jwt({ token, user, account }) {
      // Add security claims to JWT
      if (account && user) {
        token.sub = user.id;
        token.email = user.email;
        token.iat = Math.floor(Date.now() / 1000);
        token.sessionId = crypto.randomUUID();
      }
      
      // Validate token expiry
      const now = Math.floor(Date.now() / 1000);
      if (token.iat && (now - token.iat) > (8 * 60 * 60)) {
        // Token older than 8 hours, force re-authentication
        console.warn('Token expired, forcing re-authentication');
        return null;
      }
      
      return token;
    }
  },
  
  // Security events logging
  events: {
    async signIn({ user, account, profile }) {
      console.info(`Sign in event: ${user?.email}`);
    },
    async signOut({ token }) {
      console.info(`Sign out event: ${token?.email || 'unknown'}`);
    },
    async createUser({ user }) {
      console.info(`New user created: ${user.email}`);
    },
    async error(error) {
      console.error(`Auth error: ${error.message}`, {
        type: error.type,
        provider: error.provider
      });
    }
  },
  
  // Development vs production settings
  debug: process.env.NODE_ENV !== 'production',
  
  // Security pages
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  }
};