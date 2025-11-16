import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { config, validateConfig } from './config';
import { authMiddleware, errorHandler, notFoundHandler } from './middleware';
import stremioRoutes from './routes/stremio';
import mediafusionRoutes from './routes/mediafusion';
import streamRoutes from './routes/stream';

/**
 * Initialize and configure Express application
 */
export function createApp(): Application {
  const app = express();

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: false, // Allow streaming
  }));

  // CORS - allow all origins for streaming
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Range'],
    exposedHeaders: ['Content-Range', 'Accept-Ranges'],
  }));

  // Compression
  app.use(compression());

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Logging
  if (config.nodeEnv === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // Health check (no auth required)
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'self-hosted-debrid',
      version: '1.0.0',
      uptime: process.uptime(),
    });
  });

  // Root endpoint - service info
  app.get('/', (req, res) => {
    res.json({
      name: 'Self-Hosted Debrid',
      version: '1.0.0',
      description: 'Self-hosted P2P torrent streaming service',
      endpoints: {
        stremio: {
          manifest: `${config.baseUrl}/stremio/manifest.json`,
          addon: `${config.baseUrl}/stremio/manifest.json`,
          health: `${config.baseUrl}/stremio/health`,
        },
        mediafusion: {
          resolve: `${config.baseUrl}/mediafusion/resolve`,
          status: `${config.baseUrl}/mediafusion/status/:infoHash`,
          info: `${config.baseUrl}/mediafusion/info`,
          health: `${config.baseUrl}/mediafusion/health`,
        },
        stream: `${config.baseUrl}/stream/:infoHash/:fileIndex`,
      },
    });
  });

  // Apply auth middleware to protected routes
  app.use('/stremio', authMiddleware, stremioRoutes);
  app.use('/mediafusion', authMiddleware, mediafusionRoutes);
  app.use('/stream', authMiddleware, streamRoutes);

  // Error handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

/**
 * Start the server
 */
export async function startServer(): Promise<void> {
  try {
    // Validate configuration
    validateConfig();

    // Create Express app
    const app = createApp();

    // Start listening
    app.listen(config.port, () => {
      console.log('\n=================================');
      console.log('Self-Hosted Debrid Service');
      console.log('=================================');
      console.log(`Environment: ${config.nodeEnv}`);
      console.log(`Server running on: ${config.baseUrl}`);
      console.log(`\nStremio Addon URL:`);
      console.log(`  ${config.baseUrl}/stremio/manifest.json`);
      console.log(`\nMediaFusion Provider URL:`);
      console.log(`  ${config.baseUrl}/mediafusion/resolve`);
      console.log(`\nHealth Check:`);
      console.log(`  ${config.baseUrl}/health`);
      console.log('=================================\n');
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}
