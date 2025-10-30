# Drone Camera Tracker

A real-time drone camera tracking and telemetry system with WebSocket support for live video streaming and drone control.

## Features

- 🎥 Real-time video streaming from drone cameras
- 📡 Live telemetry data (GPS, altitude, battery, etc.)
- 🗺️ Interactive map with drone location tracking
- 🎮 Remote drone control interface
- 👥 Multi-device session support
- 📊 Real-time data visualization
- 🔄 WebSocket-based communication for low latency

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development and building
- TailwindCSS for styling
- shadcn/ui components
- Wouter for routing
- TanStack Query for data fetching
- Framer Motion for animations
- Recharts for data visualization

### Backend
- Node.js with Express
- WebSocket (ws) for real-time communication
- TypeScript
- In-memory storage (can be upgraded to PostgreSQL/Neon)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone <your-repo-url>
   cd DroneCamTracker
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create environment file (optional)
   ```bash
   cp .env.example .env
   ```

### Development

Run the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

### Running Production Build

```bash
npm start
```

## Project Structure

```
DroneCamTracker/
├── client/              # Frontend React application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utility functions
│   │   └── pages/       # Page components
├── server/              # Backend Express application
│   ├── index.ts         # Server entry point
│   ├── app.ts           # Express app configuration
│   ├── routes.ts        # API routes and WebSocket handlers
│   ├── storage.ts       # Data storage layer
│   └── vite.ts          # Vite integration
├── shared/              # Shared types and schemas
├── api/                 # Vercel serverless functions
├── dist/                # Build output
└── public/              # Static assets
```

## API Endpoints

### REST API

- `POST /api/sessions` - Create a new session
- `GET /api/sessions/:sessionId` - Get session details
- `GET /api/devices/:deviceId/telemetry` - Get latest telemetry

### WebSocket

Connect to `ws://localhost:3000/ws`

**Message Types:**
- `JOIN_SESSION` - Join a session with device info
- `LEAVE_SESSION` - Leave current session
- `TELEMETRY` - Send/receive telemetry data
- `OFFER` / `ANSWER` / `ICE_CANDIDATE` - WebRTC signaling
- `SWITCH_CAMERA` - Switch camera source
- `DRONE_COMMAND` - Send commands to drone
- `PING` / `PONG` - Keep-alive

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy Options

**⚠️ Important:** Vercel does not support WebSockets. For full functionality, deploy to:

- **Railway** (Recommended) - Full WebSocket support
- **Render** - Free tier with WebSocket support
- **Fly.io** - Global deployment
- **Heroku** - Classic PaaS

### Vercel Deployment (Limited)

If you want to deploy to Vercel (REST API only, no WebSockets):

```bash
npm i -g vercel
vercel login
vercel --prod
```

### Railway Deployment (Full Support)

```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
NODE_ENV=development
PORT=3000
# DATABASE_URL=postgresql://... (if using database)
# SESSION_SECRET=your-secret-key
```

## Development Tips

### Hot Reload
The development server supports hot module replacement (HMR) for fast development.

### Type Checking
```bash
npm run check
```

### Database Migrations (if using Drizzle ORM)
```bash
npm run db:push
```

## WebSocket Protocol

### Joining a Session

```json
{
  "type": "JOIN_SESSION",
  "sessionId": "session-uuid",
  "deviceId": "device-uuid",
  "deviceType": "drone|controller|viewer",
  "deviceName": "My Device"
}
```

### Sending Telemetry

```json
{
  "type": "TELEMETRY",
  "deviceId": "device-uuid",
  "payload": {
    "latitude": 37.7749,
    "longitude": -122.4194,
    "altitude": 100.5,
    "battery": 85,
    "speed": 15.2
  }
}
```

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:

**Windows:**
```powershell
netstat -ano | findstr :3000
taskkill /F /PID <PID>
```

**Linux/Mac:**
```bash
lsof -ti:3000 | xargs kill -9
```

### WebSocket Connection Failed

- Ensure you're not behind a restrictive firewall
- Check that the WebSocket URL uses the correct protocol (ws:// or wss://)
- Verify the server is running and accessible

### Build Errors

- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Check Node.js version: `node --version` (should be 18+)
- Clear build cache: `rm -rf dist`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open an issue on GitHub.
