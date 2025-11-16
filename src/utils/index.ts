/**
 * Utility functions for the self-hosted debrid service
 */

/**
 * Parse a magnet URI to extract info hash
 */
export function parseMagnetUri(magnetUri: string): string | null {
  const match = magnetUri.match(/urn:btih:([a-fA-F0-9]{40})/i);
  return match ? match[1].toLowerCase() : null;
}

/**
 * Validate info hash format
 */
export function isValidInfoHash(infoHash: string): boolean {
  return /^[a-fA-F0-9]{40}$/.test(infoHash);
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Format duration to human-readable string
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

/**
 * Check if file is a video file
 */
export function isVideoFile(filename: string): boolean {
  const videoExtensions = [
    '.mp4', '.mkv', '.avi', '.mov', '.wmv',
    '.flv', '.webm', '.m4v', '.mpg', '.mpeg',
    '.m2v', '.3gp', '.3g2', '.mxf'
  ];

  const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'));
  return videoExtensions.includes(ext);
}

/**
 * Sanitize filename for safe usage
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9.\-_\s]/gi, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_');
}

/**
 * Parse HTTP range header
 */
export function parseRange(
  rangeHeader: string,
  totalSize: number
): { start: number; end: number } | null {
  const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
  if (!match) return null;

  const start = parseInt(match[1], 10);
  const end = match[2] ? parseInt(match[2], 10) : totalSize - 1;

  if (start >= totalSize || end >= totalSize || start > end) {
    return null;
  }

  return { start, end };
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxAttempts) {
        await sleep(delayMs * attempt);
      }
    }
  }

  throw lastError;
}
