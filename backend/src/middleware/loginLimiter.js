const WINDOW_MS = 15 * 60 * 1000;
const MAX = 20;
const hits = new Map();

// Periodically clean up expired entries to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [ip, rec] of hits.entries()) {
    if (now - rec.start > WINDOW_MS) {
      hits.delete(ip);
    }
  }
}, 5 * 60 * 1000).unref();

function loginLimiter(req, res, next) {
  const ip = String(req.ip || req.headers["x-forwarded-for"] || "unknown").split(",")[0].trim();
  const now = Date.now();
  const rec = hits.get(ip) || { count: 0, start: now };

  if (now - rec.start > WINDOW_MS) {
    rec.count = 0;
    rec.start = now;
  }

  rec.count += 1;
  hits.set(ip, rec);

  if (rec.count > MAX) {
    return res.status(429).json({ message: "Too many login attempts. Try again later." });
  }

  next();
}

module.exports = { loginLimiter };
