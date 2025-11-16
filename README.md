# Self-Hosted Debrid

A complete, production-ready self-hosted debrid alternative for Stremio and MediaFusion. This service provides P2P torrent streaming capabilities without requiring any external debrid service, subscription, or API key.

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

## Features

- **100% Self-Hosted**: No external dependencies, subscriptions, or API keys required
- **Stremio Integration**: Works as a native Stremio addon
- **MediaFusion Support**: Compatible with MediaFusion's Direct Torrent (P2P) provider
- **WebTorrent Engine**: Built on Node.js and WebTorrent for reliable P2P streaming
- **HTTP Range Support**: Full seeking/scrubbing support in video players
- **Heroku-Ready**: Optimized for deployment on Heroku's ephemeral filesystem
- **Optional Authentication**: Shared-secret token protection
- **Auto-Cleanup**: Intelligent torrent management and cleanup

## Architecture

```
src/
├── index.ts                  # Application entry point
├── app.ts                    # Express server setup
├── config/
│   └── index.ts             # Environment configuration
├── types/
│   └── index.ts             # TypeScript type definitions
├── services/
│   └── debridProvider.ts    # Core torrent engine (WebTorrent abstraction)
├── routes/
│   ├── stremio.ts           # Stremio addon endpoints
│   ├── mediafusion.ts       # MediaFusion provider endpoints
│   └── stream.ts            # HTTP streaming endpoints
└── middleware/
    └── index.ts             # Authentication and error handling
```

## Prerequisites

- **Node.js** 18 or higher
- **npm** 9 or higher
- **Heroku Account** (for deployment)
- **GitHub Account** (for repository hosting)

## Local Development

### 1. Clone and Setup

```bash
# Install dependencies
npm install

# Copy environment example
cp .env.example .env

# Edit .env with your local settings
# At minimum, set BASE_URL=http://localhost:3000
```

### 2. Build and Run

```bash
# Development mode (with hot reload)
npm run dev

# Production build
npm run build
npm start
```

### 3. Test the Service

Visit `http://localhost:3000` to see the service info and available endpoints.

```bash
# Health check
curl http://localhost:3000/health

# Stremio manifest
curl http://localhost:3000/stremio/manifest.json
```

## Environment Variables

Configure these in your `.env` file (local) or Heroku Config Vars (production):

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3000` | Server port (Heroku sets this automatically) |
| `NODE_ENV` | No | `development` | Environment mode (`development` or `production`) |
| `BASE_URL` | **Yes** | - | Full base URL of your deployed app (e.g., `https://your-app.herokuapp.com`) |
| `AUTH_TOKEN` | No | - | Optional shared-secret token for authentication. If set, all requests must include this token via `Authorization: Bearer <token>` header or `?token=<token>` query parameter |
| `TORRENT_TIMEOUT` | No | `300000` | Timeout in milliseconds for torrent metadata fetching (5 minutes default) |
| `MAX_TORRENTS` | No | `10` | Maximum number of concurrent torrents to keep in memory |
| `DOWNLOAD_PATH` | No | `./tmp/torrents` | Path for temporary torrent data (ephemeral on Heroku) |

**Important**: Never use environment variable names like `REALDEBRID_API_KEY` - this service does NOT use or require Real-Debrid.

## Heroku Deployment

### Option 1: Deploy to Heroku Button (Recommended)

1. **Fork/Copy this repository** to your own GitHub account
2. **Push to GitHub** using GitHub Desktop
3. **Click the "Deploy to Heroku" button** at the top of this README
4. **Fill in the app name** and **region**
5. **Update `BASE_URL`** in Config Vars:
   - After deployment, go to your Heroku app Settings → Config Vars
   - Update `BASE_URL` to `https://your-app-name.herokuapp.com`
6. **(Optional) Set `AUTH_TOKEN`** for security
7. Click **"Deploy app"**

### Option 2: Heroku CLI

```bash
# Login to Heroku
heroku login

# Create a new Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set BASE_URL=https://your-app-name.herokuapp.com
heroku config:set AUTH_TOKEN=your-secret-token-here  # Optional

# Deploy
git push heroku main

# Open your app
heroku open
```

### Post-Deployment

After deployment, verify your service is running:

```bash
# Health check
curl https://your-app-name.herokuapp.com/health

# Service info
curl https://your-app-name.herokuapp.com/
```

## Stremio Integration

### Adding the Addon to Stremio

1. **Open Stremio** on any device
2. **Go to Addons** (puzzle piece icon)
3. **Click "Community Addons"** in the top right
4. **Scroll to bottom** and find the addon URL input
5. **Enter your addon URL**:
   ```
   https://your-app-name.herokuapp.com/stremio/manifest.json
   ```

   If you set an `AUTH_TOKEN`, include it in the URL:
   ```
   https://your-app-name.herokuapp.com/stremio/manifest.json?token=your-secret-token-here
   ```

6. **Click Install**

### How It Works

Once installed, when you select content in Stremio that has torrent sources, the addon will:
1. Receive the torrent info hash or magnet link
2. Add the torrent to the WebTorrent engine
3. Select the best video file
4. Return a streaming URL to Stremio
5. Stream the content directly via HTTP with range support

### Stremio URL Format

To manually pass torrents to the addon, use this ID format in Stremio:

- **Info Hash**: `infohash:40_character_infohash`
- **Magnet URI**: `magnet:base64_encoded_magnet_uri`

Example:
```
/stream/movie/infohash:1234567890abcdef1234567890abcdef12345678.json
```

## MediaFusion Integration

MediaFusion is a popular service that aggregates torrent sources. You can configure this backend as a "Direct Torrent (P2P)" provider in MediaFusion.

### Configuration Steps

1. **Go to MediaFusion configuration**: https://mediafusion.elfhosted.com/configure
2. **Scroll to "Debrid Service"** or **"Streaming Provider"** section
3. **Select "Direct Torrent (P2P)"** as the provider type
4. **Enter your backend URL**:
   ```
   Provider URL: https://your-app-name.herokuapp.com/mediafusion/resolve
   ```
5. **(If AUTH_TOKEN is set)** Add authentication:
   - **Header Name**: `Authorization`
   - **Header Value**: `Bearer your-secret-token-here`

   OR use token in URL:
   ```
   https://your-app-name.herokuapp.com/mediafusion/resolve?token=your-secret-token-here
   ```
6. **Save configuration**

### MediaFusion API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/mediafusion/resolve` | POST | Resolve torrent to streaming URL |
| `/mediafusion/status/:infoHash` | GET | Get torrent download status |
| `/mediafusion/info` | GET | Provider information |
| `/mediafusion/health` | GET | Health check |

### Example MediaFusion Request

```bash
curl -X POST https://your-app-name.herokuapp.com/mediafusion/resolve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{
    "infoHash": "1234567890abcdef1234567890abcdef12345678",
    "fileIndex": 0
  }'
```

**Response**:
```json
{
  "url": "https://your-app-name.herokuapp.com/stream/1234.../0",
  "name": "Movie.2024.1080p.mkv",
  "size": 1234567890,
  "ready": true
}
```

### MediaFusion Request Body Options

```typescript
{
  // One of these is required:
  "infoHash": "40-character-infohash",     // Preferred
  "magnet": "magnet:?xt=urn:btih:...",    // Also supported
  "torrentUrl": "http://example.com/file.torrent",  // Also supported

  // Optional:
  "fileIndex": 0  // Specific file index (defaults to best video file)
}
```

## API Endpoints

### Service Info

```
GET /
GET /health
```

Returns service status and available endpoints.

### Stremio Endpoints

```
GET /stremio/manifest.json
GET /stremio/stream/:type/:id.json
GET /stremio/health
```

### MediaFusion Endpoints

```
POST /mediafusion/resolve
GET /mediafusion/status/:infoHash
GET /mediafusion/info
GET /mediafusion/health
```

### Streaming Endpoints

```
GET /stream/:infoHash/:fileIndex
```

Serves video files with HTTP range support for seeking.

## Authentication

If you set the `AUTH_TOKEN` environment variable, all protected endpoints require authentication:

**Header-based**:
```bash
curl -H "Authorization: Bearer your-token" \
  https://your-app.herokuapp.com/stremio/manifest.json
```

**Query parameter**:
```bash
curl https://your-app.herokuapp.com/stremio/manifest.json?token=your-token
```

Public endpoints (no auth required):
- `GET /`
- `GET /health`

## Heroku Considerations

### Ephemeral Filesystem

Heroku dynos have an ephemeral filesystem that resets on every restart. This service is designed to handle this:

- Torrents are kept in memory (WebTorrent)
- Temporary files in `/tmp` are automatically cleaned up
- No persistent storage is required

### Dyno Sleeping

Free/Eco Heroku dynos sleep after 30 minutes of inactivity. Consider:

- Using a **Basic dyno** ($7/month) for always-on service
- Setting up a **ping service** to keep the dyno awake
- Being aware of cold-start delays (5-10 seconds)

### Resource Limits

- **Memory**: WebTorrent keeps data in memory. Monitor usage and adjust `MAX_TORRENTS`
- **Bandwidth**: Heroku has soft bandwidth limits; heavy streaming may require paid dynos

## Troubleshooting

### Stremio shows "No streams available"

1. Check that `BASE_URL` is correctly set in Heroku Config Vars
2. Verify the addon URL includes the `/stremio/manifest.json` path
3. If using `AUTH_TOKEN`, ensure the token is included in the URL
4. Check Heroku logs: `heroku logs --tail`

### MediaFusion can't connect

1. Verify the provider URL points to `/mediafusion/resolve`
2. Check authentication headers/tokens
3. Test the endpoint manually with curl
4. Review MediaFusion's error messages

### Streaming is slow or buffering

1. Torrent may have few seeders - check torrent health
2. Heroku dyno may be under-resourced - consider upgrading
3. Check the torrent status endpoint for download progress

### "Torrent not ready" errors

1. The service needs time to fetch metadata and start downloading
2. Increase `TORRENT_TIMEOUT` if needed
3. Some torrents take longer to connect to peers
4. Retry the request after a few seconds

## Development

### Project Structure

```
self-hosted-debrid/
├── src/                    # TypeScript source
├── dist/                   # Compiled JavaScript (git-ignored)
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── Procfile              # Heroku process definition
├── app.json              # Heroku app manifest
├── .env.example          # Environment template
└── README.md             # This file
```

### Scripts

```bash
npm run dev          # Development mode with auto-reload
npm run build        # Compile TypeScript to JavaScript
npm start            # Run production build
npm run type-check   # Type check without building
```

### Type Checking

```bash
npm run type-check
```

## Security Notes

1. **AUTH_TOKEN**: Use a strong, random token in production
2. **HTTPS**: Heroku provides HTTPS automatically
3. **CORS**: Currently allows all origins for streaming compatibility
4. **Rate Limiting**: Consider adding rate limiting for production use
5. **Content**: You are responsible for ensuring legal use of this service

## License

MIT License - feel free to use, modify, and distribute.

## Support

This is a self-hosted service. For issues:

1. Check the **Troubleshooting** section above
2. Review **Heroku logs**: `heroku logs --tail`
3. Verify your **environment variables** are correct
4. Test endpoints manually with `curl`

## Disclaimer

This software is provided for educational and personal use. You are responsible for complying with all applicable laws and terms of service. The authors are not responsible for any misuse of this software.

---

**Built with**: Node.js • TypeScript • Express • WebTorrent • Heroku

**No external debrid service required** • **No subscriptions** • **No API keys** • **100% self-hosted**
