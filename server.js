require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const xss = require("xss");
const hpp = require("hpp");

const sequelize = require("./config/db");
const { apiLimiter } = require("./middleware/rateLimiter");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

// ── Register all models so associations are set up ────────────
require("./models/user");
require("./models/Profile");
require("./models/Degree");
require("./models/Certification");
require("./models/Licence");
require("./models/Course");
require("./models/Employment");
require("./models/Bid");
require("./models/MonthlyLimit");
require("./models/ApiKey");
require("./models/ApiKeyLog");

// ── Routes ────────────────────────────────────────────────────
const authRoutes    = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const bidRoutes     = require("./routes/bidRoutes");
const apiKeyRoutes = require("./routes/apiKeyRoutes");
const publicRoutes = require("./routes/publicRoutes");

const app = express();

// ── Security Middleware ───────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
app.use(express.json());
app.use(hpp());
app.use((req, res, next) => {
  if (req.body) {
    for (let key in req.body) {
      if (typeof req.body[key] === "string") {
        req.body[key] = xss(req.body[key]);
      }
    }
  }
  if (req.query) {
    for (let key in req.query) {
      if (typeof req.query[key] === "string") {
        req.query[key] = xss(req.query[key]);
      }
    }
  }
  next();
});

// ── Routes ────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send("Alumni Influencer API Running");
});

app.use("/api/auth",    authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/bids",    bidRoutes);
app.use("/api", apiLimiter);
app.use("/api/keys",   apiKeyRoutes);
app.use("/api/public", publicRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── 404 Handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ── Global Error Handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

// ── Start Server ──────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected");

    await sequelize.sync({ alter: true });
    console.log("Database synced");

    // Start cron jobs AFTER db is ready
    require("./jobs/winnerSelection");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1); // Exit if DB fails — don't run without DB
  }
};

startServer();