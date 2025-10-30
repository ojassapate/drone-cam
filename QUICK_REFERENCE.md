# Quick Reference Card

## 🚀 Common Commands

### Development
```bash
npm run dev          # Start development server (port 3000)
npm run check        # Type check TypeScript
```

### Building
```bash
npm run build        # Build for production
npm run build:server # Build server only
npm start            # Run production build
```

### Database (if applicable)
```bash
npm run db:push      # Push database schema
```

## 🌐 Deployment Commands

### Vercel (Limited - No WebSockets)
```bash
vercel               # Deploy to preview
vercel --prod        # Deploy to production
vercel logs          # View logs
```

### Railway (Recommended - Full Support)
```bash
railway up           # Deploy
railway logs         # View logs
railway domain       # Add domain
railway open         # Open in browser
```

## 📁 Important Files

| File | Purpose |
|------|---------|
| `vercel.json` | Vercel configuration |
| `railway.json` | Railway configuration |
| `api/index.js` | Vercel serverless handler |
| `server/app.ts` | Express app (serverless-ready) |
| `server/index.ts` | Main server entry |
| `.env.example` | Environment variables template |

## 🔧 Environment Variables

```env
NODE_ENV=production              # Required
PORT=3000                        # Optional (default: 3000)
DATABASE_URL=postgresql://...    # If using database
SESSION_SECRET=your-secret       # For sessions
```

## 📡 API Endpoints

### REST API
```
POST   /api/sessions                    # Create session
GET    /api/sessions/:sessionId         # Get session
GET    /api/devices/:deviceId/telemetry # Get telemetry
```

### WebSocket
```
ws://localhost:3000/ws                  # WebSocket endpoint
```

## 🐛 Troubleshooting

### Port in Use
```powershell
# Windows
netstat -ano | findstr :3000
taskkill /F /PID <PID>
```

### Build Fails
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Clear Cache
```bash
rm -rf dist
npm run build
```

## 📚 Documentation

| Document | Description |
|----------|-------------|
| `README.md` | Main documentation |
| `DEPLOYMENT.md` | Full deployment guide |
| `VERCEL_SETUP.md` | Vercel quick start |
| `DEPLOYMENT_CHECKLIST.md` | Pre-deployment checklist |
| `DEPLOYMENT_SUMMARY.md` | Configuration summary |

## ⚠️ Platform Limitations

### Vercel
- ❌ No WebSockets
- ❌ No real-time features
- ✅ REST API works
- ✅ Static frontend works

### Railway/Render/Fly.io
- ✅ Full WebSocket support
- ✅ All features work
- ✅ Recommended for this project

## 🔗 Useful Links

- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs
- Node.js Docs: https://nodejs.org/docs

## 💡 Pro Tips

1. **Always test locally first:** `npm run build && npm start`
2. **Use Railway for WebSockets:** Vercel doesn't support them
3. **Check logs:** Most issues are visible in deployment logs
4. **Environment variables:** Set them in platform dashboard
5. **HTTPS:** Use `wss://` for WebSocket over HTTPS

## 🎯 Quick Deploy Decision

**Need WebSockets?**
- YES → Use Railway/Render/Fly.io
- NO → Vercel is fine

**Need Database?**
- YES → Add DATABASE_URL env var
- NO → In-memory storage works

**Need Custom Domain?**
- YES → Configure in platform settings
- NO → Use provided subdomain

## 📞 Support

- Check documentation files first
- Review error logs
- Test locally
- Open GitHub issue if needed

---

**Remember:** This project uses WebSockets extensively. Deploy to Railway, Render, or Fly.io for full functionality!
