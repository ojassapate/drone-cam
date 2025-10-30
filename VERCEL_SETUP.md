# Vercel Deployment Quick Start

## ⚠️ Critical Limitation

**Vercel does NOT support WebSocket connections in serverless functions.**

This means:
- ✅ REST API endpoints will work
- ✅ Static frontend will work
- ❌ Real-time WebSocket communication will NOT work
- ❌ Live video streaming will NOT work
- ❌ Real-time telemetry updates will NOT work

## Recommended Alternative

Deploy to **Railway**, **Render**, or **Fly.io** for full WebSocket support. See [DEPLOYMENT.md](./DEPLOYMENT.md) for details.

## If You Still Want to Deploy to Vercel

### Prerequisites

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Create a Vercel account at [vercel.com](https://vercel.com)

### Deployment Steps

1. **Login to Vercel**
   ```bash
   vercel login
   ```

2. **Deploy to Preview**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - Project name? Press Enter or type a name
   - In which directory is your code located? **.**
   - Want to override settings? **N**

3. **Deploy to Production**
   ```bash
   vercel --prod
   ```

### Configuration

The project includes:
- ✅ `vercel.json` - Vercel configuration
- ✅ `.vercelignore` - Files to exclude from deployment
- ✅ Build scripts configured in `package.json`

### Environment Variables

If you need to add environment variables:

1. **Via Vercel Dashboard:**
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add variables like:
     - `NODE_ENV` = `production`
     - `DATABASE_URL` = your database URL (if using)

2. **Via CLI:**
   ```bash
   vercel env add NODE_ENV production
   ```

### What Will Work on Vercel

✅ **Working Features:**
- Static frontend (React app)
- REST API endpoints:
  - `POST /api/sessions` - Create session
  - `GET /api/sessions/:sessionId` - Get session info
  - `GET /api/devices/:deviceId/telemetry` - Get telemetry

❌ **Non-Working Features:**
- WebSocket connections (`/ws`)
- Real-time updates
- Live video streaming
- Instant telemetry updates

### Testing Your Deployment

After deployment, test the API:

```bash
# Replace YOUR_DOMAIN with your Vercel URL
curl https://YOUR_DOMAIN.vercel.app/api/sessions -X POST
```

### Troubleshooting

**Build Fails:**
- Check build logs: `vercel logs`
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

**API Routes Not Working:**
- Check `vercel.json` routing configuration
- Verify `api/index.js` is present
- Check function logs in Vercel dashboard

**WebSocket Errors:**
- This is expected - WebSockets don't work on Vercel
- Consider deploying to Railway instead

## Alternative: Split Deployment

Deploy frontend to Vercel and backend to Railway:

1. **Frontend on Vercel:**
   - Deploy only the static build
   - Update API URLs to point to Railway

2. **Backend on Railway:**
   - Deploy full backend with WebSocket support
   - Configure CORS to allow Vercel domain

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## Getting Help

- Vercel Documentation: https://vercel.com/docs
- Railway Documentation: https://docs.railway.app
- Project Issues: Open an issue on GitHub
