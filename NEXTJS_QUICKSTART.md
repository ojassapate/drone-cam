# Next.js Migration - Quick Start Guide

## What Changed?

Your DroneStream project has been migrated from **Vite + Express** to **Next.js 14** with a custom server for WebSocket support.

## Installation

```bash
npm install
```

## Running the App

### Development Mode
```bash
npm run dev
```

This starts the custom Node.js server with Next.js and WebSocket support on `http://localhost:3000`.

### Production Mode
```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page (was client/src/pages/Home.tsx)
│   ├── providers.tsx      # Client-side providers
│   ├── globals.css        # Global styles
│   └── api/               # API routes (was server/routes.ts)
│       ├── sessions/
│       └── devices/
├── components/            # React components (copied from client/src/components)
├── hooks/                 # Custom hooks (copied from client/src/hooks)
├── lib/                   # Utilities and storage
│   ├── storage.ts        # Database storage (from server/storage.ts)
│   └── websocket-handler.js  # WebSocket logic (from server/routes.ts)
└── context/              # React contexts (copied from client/src/context)

shared/                    # Shared schemas and types (unchanged)
server.js                  # Custom Node.js server for WebSocket support
```

## Key Differences

### 1. No More Separate Client/Server
- Everything is now in the `src/` directory
- API routes are in `src/app/api/`
- Client components are in `src/components/`

### 2. File-Based Routing
- No more Wouter
- Pages are defined by the file structure in `src/app/`
- `src/app/page.tsx` is the home page

### 3. API Routes
API routes are now Next.js route handlers:

```typescript
// src/app/api/sessions/route.ts
export async function POST(request: NextRequest) {
  // Handle POST /api/sessions
}

export async function GET(request: NextRequest) {
  // Handle GET /api/sessions
}
```

### 4. WebSocket Support
WebSockets work through the custom server:
- Defined in `server.js`
- Logic in `src/lib/websocket-handler.js`
- Accessible at `ws://localhost:3000/ws`

### 5. Client Components
Components that use hooks, state, or browser APIs need `"use client"` at the top:

```typescript
"use client";

import { useState } from 'react';

export default function MyComponent() {
  const [state, setState] = useState();
  // ...
}
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run check` - Type check
- `npm run db:push` - Push database schema
- `npm run lint` - Run ESLint

## Environment Variables

All your existing environment variables work the same way. Create a `.env.local` file:

```env
DATABASE_URL=your_database_url
# ... other variables
```

## Deployment

### Platforms with Custom Server Support
- **Railway**: ✅ Full support
- **Render**: ✅ Full support
- **DigitalOcean**: ✅ Full support
- **AWS/GCP**: ✅ Full support

### Vercel
⚠️ Vercel doesn't support custom servers. For Vercel deployment, you would need to:
1. Deploy the WebSocket server separately, OR
2. Use an alternative real-time solution (like Pusher, Ably, or Socket.io with a separate server)

## Troubleshooting

### Port Already in Use
If port 3000 is in use:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change the port in server.js
```

### TypeScript Errors
Run type check:
```bash
npm run check
```

### WebSocket Connection Issues
- Ensure the custom server is running (not `next dev`)
- Check WebSocket URL is `ws://localhost:3000/ws`
- Check browser console for connection errors

## Benefits

✅ **Better Performance** - Automatic optimizations, code splitting  
✅ **SEO Ready** - Server-side rendering capabilities  
✅ **Simpler Routing** - File-based routing  
✅ **Better DX** - Fast Refresh, better error messages  
✅ **Production Ready** - Built-in optimizations  

## Need Help?

- Check `MIGRATION_GUIDE.md` for detailed migration info
- Next.js docs: https://nextjs.org/docs
- Your WebSocket logic is unchanged, just moved to `src/lib/websocket-handler.js`
