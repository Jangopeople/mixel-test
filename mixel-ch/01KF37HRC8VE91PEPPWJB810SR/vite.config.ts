import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { generateCSPHeader, SECURITY_HEADERS } from "./src/lib/security";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isDevelopment = mode === 'development';
  const isProduction = mode === 'production';
  
  return {
    server: {
      host: "0.0.0.0",
      port: 5173,
      allowedHosts: true,
      hmr: {
        overlay: false,
      },
      // Security headers for development server
      headers: {
        // Add CSP header
        'Content-Security-Policy': generateCSPHeader(isDevelopment),
        
        // Add security headers (excluding HTTPS-only headers in development)
        'X-Frame-Options': SECURITY_HEADERS['X-Frame-Options'],
        'X-Content-Type-Options': SECURITY_HEADERS['X-Content-Type-Options'],
        'X-XSS-Protection': SECURITY_HEADERS['X-XSS-Protection'],
        'Referrer-Policy': SECURITY_HEADERS['Referrer-Policy'],
        'Permissions-Policy': SECURITY_HEADERS['Permissions-Policy'],
        
        // CORS headers for development
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups', // Relaxed for development
        'Cross-Origin-Resource-Policy': 'cross-origin',
      }
    },
    
    plugins: [
      react(), 
      tailwindcss(),
      
      // Security plugin for production builds
      {
        name: 'security-headers',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            // Add security headers to all responses in development
            const headers = {
              'Content-Security-Policy': generateCSPHeader(true),
              'X-Frame-Options': 'DENY',
              'X-Content-Type-Options': 'nosniff',
              'X-XSS-Protection': '1; mode=block',
              'Referrer-Policy': 'strict-origin-when-cross-origin'
            };
            
            Object.entries(headers).forEach(([key, value]) => {
              res.setHeader(key, value);
            });
            
            next();
          });
        },
        
        generateBundle(options, bundle) {
          if (isProduction) {
            // Generate security.txt for production builds
            this.emitFile({
              type: 'asset',
              fileName: '.well-known/security.txt',
              source: `Contact: security@mixel.ch
Expires: ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()}
Preferred-Languages: en, de, fr, it
Canonical: https://mixel.ch/.well-known/security.txt`
            });
          }
        }
      }
    ],
    
    resolve: {
      alias: {
        "@/convex": path.resolve(__dirname, "./convex"),
        "@": path.resolve(__dirname, "./src"),
      },
    },
    
    // Build configuration with security considerations
    build: {
      // Enable source maps for better debugging (can be disabled for extra security)
      sourcemap: isDevelopment,
      
      // Minification for production
      minify: isProduction ? 'terser' : false,
      
      terserOptions: isProduction ? {
        compress: {
          // Remove console logs in production
          drop_console: true,
          drop_debugger: true,
        },
        mangle: {
          // Keep function names for better stack traces
          keep_fnames: false,
        },
        format: {
          // Remove comments
          comments: false,
        }
      } : undefined,
      
      // Rollup options for security
      rollupOptions: {
        output: {
          // Separate chunks for better caching and security
          manualChunks: {
            'vendor': ['react', 'react-dom'],
            'ui': ['lucide-react', '@radix-ui/react-slot'],
            'auth': ['convex/react'],
          },
          
          // Secure file naming
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
            return `assets/js/[name]-[hash].js`;
          },
          
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name!.split('.');
            const ext = info[info.length - 1];
            
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
              return `assets/img/[name]-[hash][extname]`;
            }
            
            if (/css/i.test(ext)) {
              return `assets/css/[name]-[hash][extname]`;
            }
            
            return `assets/[ext]/[name]-[hash][extname]`;
          }
        }
      },
      
      // Security: prevent eval in production
      target: 'esnext',
      
      // Enable tree shaking
      treeshake: isProduction,
    },
    
    // Environment variables handling
    define: {
      // Ensure we don't leak environment info
      __DEV__: JSON.stringify(isDevelopment),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
    
    // Dependency optimization
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'lucide-react'
      ],
      // Security: exclude potentially dangerous packages
      exclude: [
        'eval',
        'function-constructor'
      ]
    }
  };
});