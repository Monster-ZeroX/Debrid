import { Request, Response, Router } from 'express';
import { getDebridProvider } from '../services/debridProvider';

const router = Router();

/**
 * GET /stream/:infoHash/:fileIndex
 * Stream a specific file from a torrent
 * Supports HTTP range requests for seeking
 */
router.get('/:infoHash/:fileIndex', async (req: Request, res: Response) => {
  try {
    const { infoHash, fileIndex } = req.params;
    const fileIdx = parseInt(fileIndex, 10);

    if (isNaN(fileIdx)) {
      return res.status(400).send('Invalid file index');
    }

    const provider = getDebridProvider();
    const torrent = provider.getTorrent(infoHash);

    if (!torrent) {
      return res.status(404).send('Torrent not found');
    }

    // Wait for torrent to be ready
    if (!torrent.ready) {
      // Give it a moment to initialize
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (!torrent.ready) {
        return res.status(503).send('Torrent not ready yet, please retry');
      }
    }

    const file = provider.getFileByIndex(torrent, fileIdx);

    if (!file) {
      return res.status(404).send('File not found');
    }

    // Handle range requests
    const range = req.headers.range;
    const fileSize = file.length;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = (end - start) + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': getContentType(file.name),
      });

      const stream = provider.createFileStream(infoHash, fileIdx, { start, end });
      stream.pipe(res);

      stream.on('error', (err) => {
        console.error('Stream error:', err);
        if (!res.headersSent) {
          res.status(500).send('Stream error');
        }
      });

    } else {
      // Full file request
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': getContentType(file.name),
        'Accept-Ranges': 'bytes',
      });

      const stream = provider.createFileStream(infoHash, fileIdx);
      stream.pipe(res);

      stream.on('error', (err) => {
        console.error('Stream error:', err);
        if (!res.headersSent) {
          res.status(500).send('Stream error');
        }
      });
    }

  } catch (error) {
    console.error('Streaming error:', error);
    if (!res.headersSent) {
      res.status(500).send('Failed to stream file');
    }
  }
});

/**
 * Determine content type based on file extension
 */
function getContentType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop();

  const contentTypes: Record<string, string> = {
    'mp4': 'video/mp4',
    'mkv': 'video/x-matroska',
    'avi': 'video/x-msvideo',
    'mov': 'video/quicktime',
    'wmv': 'video/x-ms-wmv',
    'flv': 'video/x-flv',
    'webm': 'video/webm',
    'm4v': 'video/x-m4v',
  };

  return contentTypes[ext || ''] || 'application/octet-stream';
}

export default router;
