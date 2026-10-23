const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const authRoutes = require("./routes/auth.routes");
const appointmentRoutes = require("./routes/appointments.routes");
const usersRoutes = require("./routes/users.routes");
const departmentsRoutes = require("./routes/departments.routes");
const chatRoutes = require("./routes/chat.routes");

const app = express();

app.set("trust proxy", 1);
app.use(helmet());

const originList = String(process.env.CORS_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (process.env.NODE_ENV !== "production") return cb(null, true);
      if (originList.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
  })
);

app.use(express.json({ limit: "200kb" }));

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/departments", departmentsRoutes);
app.use("/chat", chatRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  const isProd = process.env.NODE_ENV === "production";
  const status = err.status || 500;
  const message =
    isProd && status === 500 ? "Internal server error" : err.message || "Server error";
  res.status(status).json({ message });
});

module.exports = app;
