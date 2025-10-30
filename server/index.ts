import { createApp } from "./app";
import { setupVite, serveStatic, log } from "./vite";

(async () => {
  const { app, server } = await createApp();

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 3000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 3000;
  const host = process.platform === 'win32' ? 'localhost' : '0.0.0.0';
  server.listen(port, host, () => {
    log(`serving on port ${port}`);
  });
})();
