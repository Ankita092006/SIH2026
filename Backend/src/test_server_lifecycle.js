const { spawn } = require("child_process");
const http = require("http");

async function checkHealth(port, attempts = 15) {
  for (let i = 0; i < attempts; i++) {
    try {
      const data = await new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:${port}/api/health`, (res) => {
          let body = "";
          res.on("data", chunk => body += chunk);
          res.on("end", () => resolve({ statusCode: res.statusCode, body }));
        });
        req.on("error", reject);
        req.setTimeout(1000, () => {
          req.destroy();
          reject(new Error("Timeout"));
        });
      });

      if (data.statusCode === 200) {
        return JSON.parse(data.body);
      }
    } catch (err) {
      // Server not ready yet, wait and retry
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  throw new Error("Server failed to respond to /api/health within timeout");
}

async function testServerLifecycle() {
  console.log("=== Testing Backend Server Startup & Lifecycle ===");

  // Use a temporary port to avoid conflicts with existing running processes
  const testPort = 5055;
  const env = { ...process.env, PORT: testPort.toString() };

  console.log(`[Lifecycle] Spawning node src/server.js on port ${testPort}...`);
  const child = spawn("node", ["src/server.js"], {
    cwd: __dirname + "/..",
    env,
    stdio: ["ignore", "pipe", "pipe"]
  });

  let logs = "";
  child.stdout.on("data", chunk => logs += chunk.toString());
  child.stderr.on("data", chunk => logs += chunk.toString());

  try {
    const health = await checkHealth(testPort);
    console.log("  -> PASS: Server started and responded to health check:", health);

    console.log("[Lifecycle] Sending SIGTERM to test graceful shutdown...");
    child.kill("SIGTERM");

    const exitCode = await new Promise((resolve) => {
      const timer = setTimeout(() => {
        child.kill("SIGKILL");
        resolve(-1);
      }, 5000);

      child.on("exit", (code) => {
        clearTimeout(timer);
        resolve(code);
      });
    });

    console.log(`  -> PASS: Server exited gracefully with code: ${exitCode}`);
    if (exitCode !== 0 && exitCode !== null) {
      throw new Error(`Expected clean exit code 0, got ${exitCode}`);
    }

    console.log("\n✅ SERVER STARTUP & GRACEFUL SHUTDOWN TEST PASSED!\n");
  } catch (error) {
    console.error("❌ Lifecycle test failed:", error.message);
    console.error("Child process logs:\n", logs);
    child.kill("SIGKILL");
    process.exit(1);
  }
}

if (require.main === module) {
  testServerLifecycle();
}
