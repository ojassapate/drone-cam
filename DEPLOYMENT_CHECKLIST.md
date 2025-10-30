# Deployment Checklist

Use this checklist before deploying your application to production.

## Pre-Deployment

### Code Quality
- [ ] All TypeScript errors resolved (`npm run check`)
- [ ] Build completes successfully (`npm run build`)
- [ ] No console errors in development
- [ ] Code is committed to Git
- [ ] `.gitignore` is properly configured

### Environment Setup
- [ ] `.env.example` is up to date
- [ ] Environment variables documented
- [ ] Sensitive data not in code
- [ ] API keys stored securely

### Testing
- [ ] All API endpoints tested
- [ ] WebSocket connections tested
- [ ] Frontend loads correctly
- [ ] Mobile responsiveness checked
- [ ] Cross-browser compatibility verified

## Deployment Platform Selection

### Choose Your Platform

**For Full Functionality (WebSocket Support):**
- [ ] Railway (Recommended)
- [ ] Render
- [ ] Fly.io
- [ ] Heroku

**For Static + API Only (No WebSockets):**
- [ ] Vercel (Limited functionality)

## Vercel Deployment (If Chosen)

### Before Deploying
- [ ] Understand WebSocket limitations
- [ ] Read `VERCEL_SETUP.md`
- [ ] Vercel CLI installed (`npm i -g vercel`)
- [ ] Logged into Vercel (`vercel login`)

### Configuration Files Present
- [ ] `vercel.json` exists
- [ ] `.vercelignore` exists
- [ ] `api/index.js` exists
- [ ] Build scripts configured

### Deploy
- [ ] Test deployment (`vercel`)
- [ ] Check preview URL works
- [ ] Production deployment (`vercel --prod`)
- [ ] Custom domain configured (optional)

### Post-Deployment
- [ ] Test API endpoints
- [ ] Verify static files load
- [ ] Check function logs
- [ ] Monitor for errors

## Railway Deployment (Recommended)

### Before Deploying
- [ ] Railway CLI installed (`npm i -g @railway/cli`)
- [ ] Logged into Railway (`railway login`)
- [ ] Read `DEPLOYMENT.md`

### Configuration Files Present
- [ ] `railway.json` exists
- [ ] Build scripts configured
- [ ] Start command correct

### Deploy
- [ ] Initialize project (`railway init`)
- [ ] Deploy (`railway up`)
- [ ] Add domain (`railway domain`)
- [ ] Configure environment variables

### Post-Deployment
- [ ] Test all API endpoints
- [ ] Test WebSocket connections
- [ ] Verify video streaming works
- [ ] Check telemetry updates
- [ ] Monitor logs (`railway logs`)

## Environment Variables

### Required Variables
- [ ] `NODE_ENV=production`

### Optional Variables (if applicable)
- [ ] `DATABASE_URL` (if using database)
- [ ] `SESSION_SECRET` (for sessions)
- [ ] `PORT` (if custom port needed)
- [ ] API keys for external services

## Database Setup (If Applicable)

- [ ] Database created (e.g., Neon, Railway PostgreSQL)
- [ ] Connection string obtained
- [ ] `DATABASE_URL` environment variable set
- [ ] Database migrations run (`npm run db:push`)
- [ ] Connection tested

## Security Checklist

- [ ] No hardcoded secrets in code
- [ ] Environment variables properly set
- [ ] CORS configured correctly
- [ ] HTTPS enabled (automatic on most platforms)
- [ ] Rate limiting considered
- [ ] Input validation in place

## Performance Optimization

- [ ] Build size optimized
- [ ] Images optimized
- [ ] Lazy loading implemented
- [ ] Code splitting configured
- [ ] CDN considered for static assets

## Monitoring & Logging

- [ ] Error tracking setup (optional: Sentry)
- [ ] Logging configured
- [ ] Health check endpoint available
- [ ] Uptime monitoring (optional: UptimeRobot)

## Post-Deployment Testing

### Functional Tests
- [ ] Homepage loads
- [ ] API endpoints respond
- [ ] WebSocket connects (if not Vercel)
- [ ] Session creation works
- [ ] Device connection works
- [ ] Telemetry updates work
- [ ] Video streaming works (if not Vercel)

### Performance Tests
- [ ] Page load time acceptable (<3s)
- [ ] API response time acceptable (<500ms)
- [ ] WebSocket latency acceptable (<100ms)
- [ ] No memory leaks

### Browser Tests
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

## Documentation

- [ ] README.md updated
- [ ] API documentation complete
- [ ] Deployment guide reviewed
- [ ] Environment variables documented
- [ ] Troubleshooting guide available

## Rollback Plan

- [ ] Previous version tagged in Git
- [ ] Rollback procedure documented
- [ ] Database backup available (if applicable)
- [ ] Know how to revert deployment

## Final Steps

- [ ] Deployment URL shared with team
- [ ] Documentation updated with production URL
- [ ] Monitoring alerts configured
- [ ] Team notified of deployment
- [ ] Celebrate! 🎉

## Common Issues & Solutions

### Build Fails
- Check Node.js version (18+)
- Clear `node_modules` and reinstall
- Check build logs for specific errors

### WebSocket Not Working
- Verify platform supports WebSockets
- Check WebSocket URL (ws:// vs wss://)
- Verify firewall/proxy settings

### API Errors
- Check environment variables
- Verify database connection
- Check function logs
- Test endpoints individually

### Performance Issues
- Check bundle size
- Enable compression
- Optimize database queries
- Consider caching

## Support Resources

- Project Documentation: See README.md
- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs
- GitHub Issues: [Your repo URL]
