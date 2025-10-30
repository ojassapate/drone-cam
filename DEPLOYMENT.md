# Deployment Guide

## ⚠️ Important: WebSocket Limitations on Vercel

**Vercel does not support persistent WebSocket connections** in serverless functions. This application uses WebSockets for real-time communication between drones and clients.

### Recommended Deployment Options:

#### Option 1: Split Deployment (Recommended)
- **Frontend + API**: Deploy to Vercel (static files and REST API endpoints)
- **WebSocket Server**: Deploy to a platform that supports WebSockets:
  - [Railway](https://railway.app/) - Easy deployment with WebSocket support
  - [Render](https://render.com/) - Free tier available with WebSocket support
  - [Fly.io](https://fly.io/) - Global deployment with WebSocket support
  - [Heroku](https://heroku.com/) - Classic PaaS with WebSocket support

#### Option 2: Full Deployment (No Vercel)
Deploy the entire application to one of the platforms above that supports both HTTP and WebSocket connections.

## Deploying to Vercel (API Only - No WebSockets)

If you want to deploy to Vercel anyway (without WebSocket functionality):

### Prerequisites
1. Install Vercel CLI: `npm i -g vercel`
2. Create a Vercel account at [vercel.com](https://vercel.com)

### Steps

1. **Login to Vercel**
   ```bash
   vercel login
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **For Production**
   ```bash
   vercel --prod
   ```

### Environment Variables

If using a database (like Neon), add these environment variables in Vercel dashboard:
- `DATABASE_URL` - Your database connection string
- `NODE_ENV` - Set to `production`

## Deploying to Railway (Full Support)

Railway supports both HTTP and WebSocket connections.

### Steps

1. **Install Railway CLI**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login**
   ```bash
   railway login
   ```

3. **Initialize Project**
   ```bash
   railway init
   ```

4. **Deploy**
   ```bash
   railway up
   ```

5. **Add Domain**
   ```bash
   railway domain
   ```

### Railway Configuration

Create a `railway.json` file (already configured in this project):
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## Deploying to Render

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node
4. Add environment variables if needed
5. Deploy

## Environment Variables

Make sure to set these environment variables in your deployment platform:

- `NODE_ENV=production`
- `DATABASE_URL` (if using a database)
- Any other API keys or secrets your app needs

## Post-Deployment

1. Test all API endpoints
2. Test WebSocket connections (if not on Vercel)
3. Check logs for any errors
4. Monitor performance and errors

## Troubleshooting

### WebSockets not working
- Ensure you're not deploying to Vercel
- Check that your deployment platform supports WebSockets
- Verify the WebSocket URL is correct (wss:// for HTTPS)

### Build failures
- Check Node.js version (should be 18+)
- Verify all dependencies are in `package.json`
- Check build logs for specific errors

### Database connection issues
- Verify `DATABASE_URL` environment variable is set
- Check database allows connections from your deployment platform
- For Neon, ensure you're using the correct connection string format
