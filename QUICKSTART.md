# Quick Start Guide

## For Complete Beginners

This guide will walk you through deploying your self-hosted debrid service from scratch.

## Step 1: Get the Code on GitHub

1. **Copy/Clone this repository** to your local machine
2. **Open GitHub Desktop**
3. **File → Add Local Repository**
4. **Select** the `C:\PythonProjects\Debrid` folder
5. **Publish Repository** to GitHub (button in top right)
   - Name it something like `my-debrid-service`
   - Keep it **Private** if you prefer
   - Click **Publish**

## Step 2: Deploy to Heroku

### Option A: Using the Deploy Button (Easiest)

1. **Go to your GitHub repository** in a web browser
2. **Click the "Deploy to Heroku" button** in the README
3. **Fill in the form**:
   - **App name**: Choose a unique name (e.g., `my-debrid-stream`)
   - **Region**: Choose your closest region
   - **BASE_URL**: Enter `https://your-app-name.herokuapp.com` (replace with your actual app name)
   - **AUTH_TOKEN**: (Optional) Enter a secret password like `my-secret-token-12345`
4. **Click "Deploy app"**
5. **Wait 2-3 minutes** for deployment to complete
6. **Click "View"** to see your running app

### Option B: Using Heroku Dashboard

1. **Go to** https://dashboard.heroku.com
2. **Click "New" → "Create new app"**
3. **Enter app name** and select region
4. **Click "Create app"**
5. **Go to "Deploy" tab**
6. **Connect to GitHub**:
   - Click "Connect to GitHub"
   - Search for your repository
   - Click "Connect"
7. **Scroll down** and click **"Deploy Branch"** (main)
8. **Go to "Settings" tab**
9. **Click "Reveal Config Vars"**
10. **Add these variables**:
    - `NODE_ENV` = `production`
    - `BASE_URL` = `https://your-app-name.herokuapp.com`
    - `AUTH_TOKEN` = `your-secret-token` (optional)

## Step 3: Verify It's Working

1. **Open your app URL**: `https://your-app-name.herokuapp.com`
2. **You should see** JSON with service information
3. **Test health check**: `https://your-app-name.herokuapp.com/health`

## Step 4: Add to Stremio

1. **Open Stremio** on your device
2. **Click the Addons icon** (puzzle piece) in the top right
3. **Scroll to the bottom**
4. **Find the URL input box** (usually says "Add addon")
5. **Enter**:
   ```
   https://your-app-name.herokuapp.com/stremio/manifest.json
   ```

   If you set AUTH_TOKEN:
   ```
   https://your-app-name.herokuapp.com/stremio/manifest.json?token=your-secret-token
   ```

6. **Press Enter** or **Click Install**
7. **Look for "Self-Hosted Debrid"** in your installed addons

## Step 5: Configure MediaFusion (Optional)

1. **Go to** https://mediafusion.elfhosted.com/configure
2. **Find the "Debrid Service" or "Streaming Provider" section**
3. **Select "Direct Torrent (P2P)"** from the dropdown
4. **Enter your backend URL**:
   ```
   https://your-app-name.herokuapp.com/mediafusion/resolve
   ```
5. **If you have AUTH_TOKEN**, add it as a query parameter:
   ```
   https://your-app-name.herokuapp.com/mediafusion/resolve?token=your-secret-token
   ```

   OR use the authentication header fields:
   - Header Name: `Authorization`
   - Header Value: `Bearer your-secret-token`

6. **Save the configuration**

## Testing Your Service

### Test with curl (Windows PowerShell)

```powershell
# Health check
curl https://your-app-name.herokuapp.com/health

# Service info
curl https://your-app-name.herokuapp.com/

# Stremio manifest
curl https://your-app-name.herokuapp.com/stremio/manifest.json
```

### Test with a browser

Just paste any of these URLs into your browser:
- `https://your-app-name.herokuapp.com/`
- `https://your-app-name.herokuapp.com/health`
- `https://your-app-name.herokuapp.com/stremio/manifest.json`

## Troubleshooting

### "Application Error" when opening the app

**Solution**: Check your Heroku logs
1. Go to https://dashboard.heroku.com
2. Click on your app
3. Click "More" → "View logs"
4. Look for error messages

Common issues:
- `BASE_URL` not set correctly
- Build failed (check logs for npm errors)

### Stremio doesn't show streams

**Solution**:
1. Make sure the addon is installed correctly
2. Check the URL format is exact: `.../stremio/manifest.json`
3. If using AUTH_TOKEN, make sure it's in the URL: `?token=your-token`
4. Try uninstalling and reinstalling the addon

### MediaFusion can't connect

**Solution**:
1. Verify the URL points to `/mediafusion/resolve`
2. Include the token if you set one
3. Test the endpoint with curl first

### Video won't play / endless buffering

**Possible causes**:
1. Torrent has no seeders (check the torrent health)
2. Heroku dyno is sleeping (first request may be slow)
3. Heroku free tier bandwidth limits

**Solutions**:
- Wait 10-15 seconds and try again
- Upgrade to a Basic Heroku dyno ($7/month)
- Use torrents with good seeder counts

## Local Development (Advanced)

If you want to run locally for testing:

```bash
# Navigate to the project
cd C:\PythonProjects\Debrid

# Install dependencies
npm install

# Copy environment file
copy .env.example .env

# Edit .env with your settings
notepad .env

# Build the project
npm run build

# Run it
npm start
```

Then open http://localhost:3000

## Updating Your Deployment

After making changes:

1. **Commit changes** in GitHub Desktop
2. **Push to GitHub** (click "Push origin")
3. **In Heroku Dashboard**:
   - Go to "Deploy" tab
   - Scroll to "Manual deploy"
   - Click "Deploy Branch"

OR enable automatic deploys:
1. Go to "Deploy" tab
2. Click "Enable Automatic Deploys"
3. Now every push to GitHub will deploy automatically

## Cost

- **Free Tier**: Limited hours per month, dyno sleeps after 30 min
- **Eco Dyno**: $5/month, 1000 hours shared across apps
- **Basic Dyno**: $7/month per app, always-on, better for streaming

## Getting Help

1. Check the main README.md file
2. Review Heroku logs for errors
3. Test endpoints with curl to isolate issues
4. Verify environment variables are set correctly

## Security Tips

1. **Always use a strong AUTH_TOKEN** in production
2. **Keep your token secret** - don't share publicly
3. **Use HTTPS** (Heroku provides this automatically)
4. **Monitor usage** to avoid abuse

---

**Congratulations!** You now have your own self-hosted debrid service running on Heroku, integrated with Stremio and MediaFusion.
