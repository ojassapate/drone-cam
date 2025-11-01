# Migration from Vite to Next.js

This project has been migrated from Vite + Express to Next.js with a custom server for WebSocket support.

## Architecture Changes

### Before (Vite + Express)
- **Frontend**: Vite dev server with React
- **Backend**: Express server with WebSocket support
- **Routing**: Wouter for client-side routing
- **Structure**: Separate `client/` and `server/` directories

### After (Next.js)
- **Framework**: Next.js 14 with App Router
- **Backend**: Next.js API routes + Custom Node.js server for WebSockets
- **Routing**: Next.js file-based routing
- **Structure**: Unified `src/` directory with `app/` for pages and API routes

## Key Changes

### 1. Project Structure
```
Old:
├── client/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       ├── lib/
│       └── context/
├── server/
│   ├── routes.ts
│   ├── storage.ts
│   └── app.ts
└── vite.config.ts

New:
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── providers.tsx
│   │   ├── globals.css
│   │   └── api/
│   │       ├── sessions/
│   │       └── devices/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   │   ├── storage.ts
│   │   └── websocket-handler.js
│   └── context/
├── shared/
├── server.js (Custom server for WebSockets)
└── next.config.js
```

### 2. Removed Dependencies
- `vite`
- `@vitejs/plugin-react`
- `wouter` (replaced with Next.js routing)
- `@replit/vite-plugin-*` (Replit-specific plugins)
- `tsx` (for dev server)
- `esbuild` (for server bundling)
- `cross-env`

### 3. Added Dependencies
- `next` - Next.js framework
- `server-only` - Server-side only code marker
- `eslint-config-next` - Next.js ESLint configuration

### 4. API Routes Migration

Express routes have been converted to Next.js API routes:

**Old (Express):**
```typescript
app.post('/api/sessions', async (req, res) => { ... });
app.get('/api/sessions/:sessionId', async (req, res) => { ... });
```

**New (Next.js):**
```typescript
// src/app/api/sessions/route.ts
export async function POST(request: NextRequest) { ... }

// src/app/api/sessions/[sessionId]/route.ts
export async function GET(request: NextRequest, { params }) { ... }
```

### 5. WebSocket Support

Since Next.js doesn't natively support WebSockets, a custom Node.js server is used:

- **Custom Server**: `server.js` - Wraps Next.js with an HTTP server
- **WebSocket Handler**: `src/lib/websocket-handler.js` - Handles all WebSocket logic
- The WebSocket server runs on the same port (3000) as the Next.js app at path `/ws`

### 6. Client-Side Changes

- **Routing**: Removed `wouter`, now using Next.js built-in routing
- **Pages**: Converted to Next.js App Router format
  - `client/src/pages/Home.tsx` → `src/app/page.tsx`
  - Added `"use client"` directive for client components
- **Layout**: Created `src/app/layout.tsx` for app-wide layout
- **Providers**: Created `src/app/providers.tsx` for client-side context providers

### 7. Configuration Files

- **tsconfig.json**: Updated for Next.js with proper paths and plugins
- **next.config.js**: Created for Next.js configuration
- **.eslintrc.json**: Added for Next.js linting
- **package.json**: Updated scripts and dependencies

## Running the Application

### Development
```bash
npm install
npm run dev
```

The custom server will start on `http://localhost:3000` with WebSocket support at `ws://localhost:3000/ws`.

### Production Build
```bash
npm run build
npm start
```

### Database
```bash
npm run db:push
```

## Important Notes

1. **WebSocket Connection**: The WebSocket connection URL remains the same (`ws://localhost:3000/ws` in dev)

2. **Environment Variables**: All existing environment variables work the same way

3. **Database**: No changes to database schema or Drizzle ORM usage

4. **Styling**: TailwindCSS configuration remains unchanged

5. **Components**: All React components work as-is, with `"use client"` added where needed

6. **Shared Code**: The `shared/` directory remains unchanged and is accessible from both client and server

## Benefits of Migration

1. **Better Performance**: Next.js optimizations (automatic code splitting, image optimization, etc.)
2. **SEO Ready**: Server-side rendering capabilities
3. **Simplified Routing**: File-based routing system
4. **Better Developer Experience**: Fast Refresh, better error messages
5. **Production Ready**: Built-in optimization and deployment support
6. **Type Safety**: Better TypeScript integration

## Deployment

The application can be deployed to:
- **Vercel**: Native Next.js support (requires WebSocket alternative or separate WS server)
- **Railway/Render**: Full support including custom server and WebSockets
- **Docker**: Can be containerized with the custom server

Note: For platforms that don't support custom servers (like Vercel), you'll need to deploy the WebSocket server separately or use an alternative real-time solution.
