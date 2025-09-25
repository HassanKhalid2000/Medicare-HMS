import { INestApplication } from '@nestjs/common';
import helmet from 'helmet';
const compression = require('compression');

export interface SecurityConfig {
  enableHelmet: boolean;
  enableCompression: boolean;
  maxRequestSize: string;
  corsOrigins: string[];
  trustedProxies: string[];
  rateLimit: {
    windowMs: number;
    max: number;
    skipSuccessfulRequests: boolean;
  };
  helmet: {
    contentSecurityPolicy: boolean;
    crossOriginEmbedderPolicy: boolean;
    crossOriginOpenerPolicy: boolean;
    crossOriginResourcePolicy: boolean;
    dnsPrefetchControl: boolean;
    frameguard: boolean;
    hidePoweredBy: boolean;
    hsts: boolean;
    ieNoOpen: boolean;
    noSniff: boolean;
    originAgentCluster: boolean;
    permittedCrossDomainPolicies: boolean;
    referrerPolicy: boolean;
    xssFilter: boolean;
  };
}

export const getSecurityConfig = (): SecurityConfig => ({
  enableHelmet: true, // Now properly enabled
  enableCompression: false, // Disabled temporarily to fix startup issues
  maxRequestSize: '10mb',
  corsOrigins: [
    process.env.CLIENT_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'https://localhost:3000',
  ],
  trustedProxies: ['127.0.0.1', '::1'],
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    skipSuccessfulRequests: false,
  },
  helmet: {
    contentSecurityPolicy: process.env.NODE_ENV === 'production',
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: false,
    dnsPrefetchControl: true,
    frameguard: false,
    hidePoweredBy: true,
    hsts: false,
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: false,
    referrerPolicy: false,
    xssFilter: true,
  },
});

export const applySecurityMiddleware = (app: INestApplication): void => {
  const config = getSecurityConfig();

  // Apply Helmet for security headers
  if (config.enableHelmet) {
    app.use(helmet({
      contentSecurityPolicy: config.helmet.contentSecurityPolicy,
      crossOriginEmbedderPolicy: config.helmet.crossOriginEmbedderPolicy,
      crossOriginOpenerPolicy: config.helmet.crossOriginOpenerPolicy,
      crossOriginResourcePolicy: config.helmet.crossOriginResourcePolicy,
      dnsPrefetchControl: config.helmet.dnsPrefetchControl,
      frameguard: config.helmet.frameguard,
      hidePoweredBy: config.helmet.hidePoweredBy,
      hsts: config.helmet.hsts,
      ieNoOpen: config.helmet.ieNoOpen,
      noSniff: config.helmet.noSniff,
      originAgentCluster: config.helmet.originAgentCluster,
      permittedCrossDomainPolicies: config.helmet.permittedCrossDomainPolicies,
      referrerPolicy: config.helmet.referrerPolicy,
      xssFilter: config.helmet.xssFilter,
    }));
  }

  // Apply compression middleware (disabled temporarily)
  // if (config.enableCompression) {
  //   app.use(compression());
  // }

  // Set trust proxy for reverse proxy setups
  app.getHttpAdapter().getInstance().set('trust proxy', config.trustedProxies);

  // Set maximum request size
  app.use('/api', (req: any, res: any, next: any) => {
    const contentLength = req.headers['content-length'];
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB limit
      return res.status(413).json({
        statusCode: 413,
        message: 'Request entity too large',
        error: 'Payload Too Large'
      });
    }
    next();
  });

  // Add security headers manually if needed
  app.use((req: any, res: any, next: any) => {
    res.setHeader('X-Powered-By', 'MediCore HMS');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });
};