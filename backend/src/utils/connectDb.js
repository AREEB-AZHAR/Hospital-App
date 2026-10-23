const dns = require("dns");
const mongoose = require("mongoose");

// Fix for Windows / Node.js DNS SRV/TXT query timeouts with MongoDB Atlas
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  // Ignore if custom DNS fails
}

let memoryServer = null;

async function startMemoryServer() {
  const { MongoMemoryServer } = require("mongodb-memory-server");
  console.log("⚡ Starting zero-config in-memory MongoDB server...");
  memoryServer = await MongoMemoryServer.create();
  const uri = memoryServer.getUri() + "hospital";
  await mongoose.connect(uri);
  console.log("✅ In-memory MongoDB connected successfully!");
  console.log("💡 Tip: Set MONGODB_URI in backend/.env whenever you want persistent cloud storage.");

  const cleanup = async () => {
    if (memoryServer) {
      await mongoose.disconnect().catch(() => {});
      await memoryServer.stop().catch(() => {});
      memoryServer = null;
    }
  };

  process.once("SIGINT", cleanup);
  process.once("SIGTERM", cleanup);
  process.once("exit", cleanup);
}

module.exports = async function connectDb() {
  const uri = process.env.MONGODB_URI;

  if (process.env.USE_MEMORY_DB === "true" || !uri) {
    return startMemoryServer();
  }

  if (uri.includes("<db_password>")) {
    throw new Error(
      "MONGODB_URI in backend/.env contains '<db_password>'. Please replace it with your real MongoDB Atlas password."
    );
  }

  const isLocal = uri.includes("127.0.0.1") || uri.includes("localhost");
  const startupTimeoutMs = isLocal
    ? 2500
    : Math.max(1000, Number(process.env.MONGODB_CONNECT_TIMEOUT_MS) || 15000);

  mongoose.set("strictQuery", true);
  let timeout;
  try {
    await Promise.race([
      mongoose.connect(uri, {
        serverSelectionTimeoutMS: isLocal ? 2000 : 5000,
        connectTimeoutMS: isLocal ? 2000 : 5000,
      }),
      new Promise((_, reject) => {
        timeout = setTimeout(
          () =>
            reject(
              new Error(
                `MongoDB connection timed out after ${startupTimeoutMs / 1000}s.`
              )
            ),
          startupTimeoutMs
        );
      }),
    ]);
    console.log("✅ MongoDB connected to " + (isLocal ? "local database" : "cluster"));
  } catch (err) {
    await mongoose.disconnect().catch(() => {});
    if (isLocal) {
      console.warn("⚠️ Local MongoDB service not reachable (" + err.message + ").");
      return startMemoryServer();
    }
    console.error("❌ MongoDB connection failed:", err.message);
    throw err;
  } finally {
    clearTimeout(timeout);
  }
};
