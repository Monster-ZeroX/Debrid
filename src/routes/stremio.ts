import { Request, Response, Router } from 'express';
import { getDebridProvider } from '../services/debridProvider';
import { StremioManifest, StremioStreamResponse } from '../types';
import { config } from '../config';

const router = Router();

/**
 * Stremio addon manifest
 */
const manifest: StremioManifest = {
  id: 'com.selfhosted.debrid',
  version: '1.0.0',
  name: 'Self-Hosted Debrid',
  description: 'Self-hosted P2P torrent streaming service for Stremio',
  resources: ['stream'],
  types: ['movie', 'series'],
  catalogs: [],
  idPrefixes: ['tt'],
  behaviorHints: {
    configurable: false,
    configurationRequired: false,
  },
};

/**
 * GET /stremio/manifest.json
 * Returns the Stremio addon manifest
 */
router.get('/manifest.json', (req: Request, res: Response) => {
  res.json(manifest);
});

/**
 * GET /stremio/stream/:type/:id.json
 * Returns streaming sources for the given content
 *
 * The ID can be in formats:
 * - tt1234567 (IMDB ID)
 * - infohash:40_char_infohash (torrent infohash)
 * - magnet:base64_encoded_magnet (magnet URI)
 */
router.get('/stream/:type/:id.json', async (req: Request, res: Response) => {
  try {
    const { type, id } = req.params;

    // Parse the ID to extract torrent information
    let infoHash: string | null = null;
    let magnetUri: string | null = null;

    // Check if ID contains infohash prefix
    if (id.includes(':')) {
      const [prefix, value] = id.split(':');

      if (prefix === 'infohash') {
        infoHash = value;
      } else if (prefix === 'magnet') {
        // Decode base64 magnet URI
        magnetUri = Buffer.from(value, 'base64').toString('utf-8');
      }
    }

    // If we don't have torrent info, return empty streams
    if (!infoHash && !magnetUri) {
      const response: StremioStreamResponse = {
        streams: [],
      };
      return res.json(response);
    }

    // Get or add the torrent
    const provider = getDebridProvider();
    const torrentInfo = await provider.addTorrent(magnetUri || infoHash!);

    // Create stream URL
    const streamUrl = await provider.createStreamUrl(torrentInfo.infoHash);

    // Get the best video file name
    const torrent = provider.getTorrent(torrentInfo.infoHash);
    let fileName = 'Video';
    if (torrent) {
      const bestFile = provider.getBestVideoFile(torrent);
      if (bestFile) {
        fileName = bestFile.name;
      }
    }

    const response: StremioStreamResponse = {
      streams: [
        {
          name: 'Self-Hosted Debrid',
          title: fileName,
          url: streamUrl,
          behaviorHints: {
            bingeGroup: `debrid-${torrentInfo.infoHash}`,
            notWebReady: false,
          },
        },
      ],
    };

    res.json(response);

  } catch (error) {
    console.error('Stremio stream error:', error);
    res.json({ streams: [] });
  }
});

/**
 * GET /stremio/health
 * Health check endpoint
 */
router.get('/health', (req: Request, res: Response) => {
  const provider = getDebridProvider();
  const activeTorrents = provider.getActiveTorrents();

  res.json({
    status: 'ok',
    service: 'stremio-addon',
    activeTorrents: activeTorrents.length,
    torrents: activeTorrents,
  });
});

export default router;
