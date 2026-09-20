const app = require("./app");
const { initDB, closePool } = require("./db");
const { port, nodeEnv } = require("./config/env");

let server;

const startServer = async () => {
  try {
    console.log("[Server] Initializing database layer...");
    await initDB();

    server = app.listen(port, () => {
      console.log(`\n🚀 SIH26003 Dementia Platform Backend active`);
      console.log(`🌐 Environment : ${nodeEnv}`);
      console.log(`🔌 Listening on : http://localhost:${port}`);
      console.log(`🩺 Health Check : http://localhost:${port}/api/health\n`);
    });
  } catch (error) {
    console.error("❌ Fatal startup error:", error.message);
    process.exit(1);
  }
};

/**
 * Graceful shutdown coordinator
 */
const shutdown = async (signal) => {
  console.log(`\n[Server] Received ${signal}. Starting graceful shutdown...`);

  if (server) {
    server.close(async () => {
      console.log("[Server] HTTP server stopped accepting new connections.");
      await closePool();
      console.log("[Server] Graceful shutdown completed.");
      process.exit(0);
    });

    // Enforce shutdown timeout in case of hanging sockets
    setTimeout(() => {
      console.error("[Server] Forcefully terminating after shutdown timeout.");
      process.exit(1);
    }, 10000).unref();
  } else {
    await closePool();
    process.exit(0);
  }
};

// Process lifecycle event handlers
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Promise Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  shutdown("uncaughtException");
});

if (require.main === module) {
  startServer();
}

module.exports = {
  startServer,
  shutdown
};