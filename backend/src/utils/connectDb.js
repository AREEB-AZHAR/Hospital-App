const dns = require("dns");
const mongoose = require("mongoose");

// Fix for Windows / Node.js DNS SRV/TXT query timeouts with MongoDB Atlas
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  // Ignore if custom DNS fails
}

module.exports = async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI missing in .env");

  if (uri.includes("<db_password>")) {
    throw new Error(
      "MONGODB_URI in backend/.env contains '<db_password>'. Please replace it with your real MongoDB Atlas password."
    );
  }

  const startupTimeoutMs = Math.max(
    1000,
    Number(process.env.MONGODB_CONNECT_TIMEOUT_MS) || 15000
  );

  mongoose.set("strictQuery", true);
  let timeout;
  try {
    await Promise.race([
      mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      }),
      new Promise((_, reject) => {
        timeout = setTimeout(
          () =>
            reject(
              new Error(
                `MongoDB connection timed out after ${startupTimeoutMs / 1000}s. ` +
                  "Check your Atlas Network Access allowlist, DNS, and MONGODB_URI."
              )
            ),
          startupTimeoutMs
        );
      }),
    ]);
    console.log("✅ MongoDB connected");
  } catch (err) {
    await mongoose.disconnect().catch(() => {});
    console.error("❌ MongoDB connection failed:", err.message);
    throw err;
  } finally {
    clearTimeout(timeout);
  }
};
