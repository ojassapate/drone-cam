// Note: WebSockets are not supported on Vercel serverless functions
// This handler only supports HTTP API routes
// For WebSocket support, consider deploying to Railway, Render, or Fly.io

let appInstance;

async function getApp() {
  if (!appInstance) {
    // Dynamically import the app
    const { createApp } = await import("../dist/app.js");
    const { app } = await createApp();
    appInstance = app;
  }
  return appInstance;
}

// Vercel serverless function handler
export default async function handler(req, res) {
  try {
    const app = await getApp();
    return app(req, res);
  } catch (error) {
    console.error("Error handling request:", error);
    res.status(500).json({ 
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
}
