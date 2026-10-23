require("dotenv").config();
const app = require("./app");
const connectDb = require("./utils/connectDb");
const seedDepartments = require("./utils/seedDepartments");

const PORT = process.env.PORT || 4000;

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET missing in .env");
  process.exit(1);
}

(async () => {
  await connectDb();
  await seedDepartments();
  app.listen(PORT, "0.0.0.0", () =>
    console.log(`API running on http://0.0.0.0:${PORT}`)
  );
})().catch((err) => {
  console.error("Server startup failed:", err.message);
  process.exit(1);
});
