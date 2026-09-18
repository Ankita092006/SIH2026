const app = require("./app");
const { connectDB } = require("./config/db");
const { port } = require("./config/env");

const startServer = async () => {
  try {
    await connectDB();

    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`http://localhost:${port}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();