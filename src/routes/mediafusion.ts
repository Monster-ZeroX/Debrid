import { Request, Response, Router } from 'express';
import { getDebridProvider } from '../services/debridProvider';
import { MediaFusionResolveRequest, MediaFusionResolveResponse } from '../types';

const router = Router();

/**
 * POST /mediafusion/resolve
 * MediaFusion Direct Torrent (P2P) provider endpoint
 *
 * Accepts torrent resolution requests and returns streaming URLs
 *
 * Request body:
 * {
 *   "infoHash": "40-character-infohash",  // OR
 *   "magnet": "magnet:?xt=...",           // OR
 *   "torrentUrl": "http://...",
 *   "fileIndex": 0  // optional, defaults to best video file
 * }
 */
router.post('/resolve', async (req: Request, res: Response) => {
  try {
    const body: MediaFusionResolveRequest = req.body;

    // Extract torrent identifier
    const torrentId = body.infoHash || body.magnet || body.torrentUrl;
    if (!torrentId) {
      return res.status(400).json({
        error: 'Missing torrent identifier (infoHash, magnet, or torrentUrl required)',
      });
    }

    // Add the torrent
    const provider = getDebridProvider();
    const torrentInfo = await provider.addTorrent(torrentId);

    // Create streaming URL
    const streamUrl = await provider.createStreamUrl(
      torrentInfo.infoHash,
      body.fileIndex
    );

    // Get file information
    const torrent = provider.getTorrent(torrentInfo.infoHash);
    let fileName = 'Video';
    let fileSize = 0;

    if (torrent) {
      let file;
      if (body.fileIndex !== undefined) {
        file = provider.getFileByIndex(torrent, body.fileIndex);
      } else {
        file = provider.getBestVideoFile(torrent);
      }

      if (file) {
        fileName = file.name;
        fileSize = file.length;
      }
    }

    const response: MediaFusionResolveResponse = {
      url: streamUrl,
      name: fileName,
      size: fileSize,
      ready: torrent?.ready || false,
    };

    res.json(response);

  } catch (error: any) {
    console.error('MediaFusion resolve error:', error);
    res.status(500).json({
      error: error.message || 'Failed to resolve torrent',
    });
  }
});

/**
 * GET /mediafusion/status/:infoHash
 * Get torrent status for MediaFusion
 */
router.get('/status/:infoHash', (req: Request, res: Response) => {
  try {
    const { infoHash } = req.params;
    const provider = getDebridProvider();
    const status = provider.getTorrentStatus(infoHash);

    if (!status) {
      return res.status(404).json({
        error: 'Torrent not found',
      });
    }

    res.json(status);

  } catch (error: any) {
    console.error('MediaFusion status error:', error);
    res.status(500).json({
      error: error.message || 'Failed to get torrent status',
    });
  }
});

/**
 * GET /mediafusion/health
 * Health check for MediaFusion integration
 */
router.get('/health', (req: Request, res: Response) => {
  const provider = getDebridProvider();
  const activeTorrents = provider.getActiveTorrents();

  res.json({
    status: 'ok',
    service: 'mediafusion-provider',
    activeTorrents: activeTorrents.length,
    torrents: activeTorrents,
  });
});

/**
 * GET /mediafusion/info
 * Provider information for MediaFusion configuration
 */
router.get('/info', (req: Request, res: Response) => {
  res.json({
    name: 'Self-Hosted Debrid',
    type: 'direct-torrent',
    version: '1.0.0',
    description: 'Self-hosted P2P torrent streaming provider',
    endpoints: {
      resolve: '/mediafusion/resolve',
      status: '/mediafusion/status/:infoHash',
      health: '/mediafusion/health',
    },
  });
});

export default router;
