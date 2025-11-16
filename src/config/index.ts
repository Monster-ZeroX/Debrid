import dotenv from 'dotenv';
import { Config } from '../types';

// Load environment variables
dotenv.config();

/**
 * Application configuration loaded from environment variables
 */
export const config: Config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  baseUrl: process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`,
  authToken: process.env.AUTH_TOKEN,
  torrentTimeout: parseInt(process.env.TORRENT_TIMEOUT || '300000', 10), // 5 minutes default
  maxTorrents: parseInt(process.env.MAX_TORRENTS || '10', 10),
  downloadPath: process.env.DOWNLOAD_PATH || './tmp/torrents',
};

/**
 * Validate required configuration
 */
export function validateConfig(): void {
  if (!config.port || config.port < 1 || config.port > 65535) {
    throw new Error('Invalid PORT configuration');
  }

  if (!config.baseUrl) {
    throw new Error('BASE_URL must be configured');
  }

  console.log('Configuration loaded:', {
    port: config.port,
    nodeEnv: config.nodeEnv,
    baseUrl: config.baseUrl,
    authTokenSet: !!config.authToken,
    torrentTimeout: config.torrentTimeout,
    maxTorrents: config.maxTorrents,
  });
}
