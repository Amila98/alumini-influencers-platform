require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const xss = require("xss");
const hpp = require("hpp");

const sequelize = require("./config/db");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

// Models
require("./models/User");
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

// Routes
const authRoutes    = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const bidRoutes     = require("./routes/bidRoutes");
const apiKeyRoutes  = require("./routes/apiKeyRoutes");
const publicRoutes  = require("./routes/publicRoutes");

const app = express();

// Middleware
app.use(helmet());

const allowedOrigins = [
  'http://localhost:5173', 
  'http://127.0.0.1:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());
app.use(hpp());

// Basic XSS Protection
app.use((req, res, next) => {
  const sanitize = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === "string") obj[key] = xss(obj[key]);
    }
  };
  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  next();
});

// Base Route
app.get("/", (req, res) => {
  res.send("Alumni Influencer API Running");
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/keys", apiKeyRoutes);
app.use("/api/public", publicRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: err.message });
  }
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    
    await sequelize.sync({ force: true }); 
    console.log("Database synced cleanly");

    require("./jobs/winnerSelection");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1); 
  }
};

startServer();
