process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err.message);
  console.error(err.stack);
});
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err.message);
  console.error(err.stack);
});


require("dotenv").config({ path: '.env', override: false });
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('NODE_ENV:', process.env.NODE_ENV);

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const xss = require("xss");
const hpp = require("hpp");

const sequelize = require("./config/db");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

// Models
//require("./models/User");
//require("./models/Profile");
//require("./models/Degree");
//require("./models/Certification");
//require("./models/Licence");
//require("./models/Course");
//require("./models/Employment");
//require("./models/Bid");
//require("./models/MonthlyLimit");
//require("./models/ApiKey");
//require("./models/ApiKeyLog");

// Routes
//const authRoutes    = require("./routes/authRoutes");
//const profileRoutes = require("./routes/profileRoutes");
//const bidRoutes     = require("./routes/bidRoutes");
//const apiKeyRoutes  = require("./routes/apiKeyRoutes");
//const publicRoutes  = require("./routes/publicRoutes");


console.log('Loading models...');
try { require("./models/User"); console.log('✅ User'); } catch(e) { console.error('❌ User:', e.message); }
try { require("./models/Profile"); console.log('✅ Profile'); } catch(e) { console.error('❌ Profile:', e.message); }
try { require("./models/Degree"); console.log('✅ Degree'); } catch(e) { console.error('❌ Degree:', e.message); }
try { require("./models/Certification"); console.log('✅ Certification'); } catch(e) { console.error('❌ Certification:', e.message); }
try { require("./models/Licence"); console.log('✅ Licence'); } catch(e) { console.error('❌ Licence:', e.message); }
try { require("./models/Course"); console.log('✅ Course'); } catch(e) { console.error('❌ Course:', e.message); }
try { require("./models/Employment"); console.log('✅ Employment'); } catch(e) { console.error('❌ Employment:', e.message); }
try { require("./models/Bid"); console.log('✅ Bid'); } catch(e) { console.error('❌ Bid:', e.message); }
try { require("./models/MonthlyLimit"); console.log('✅ MonthlyLimit'); } catch(e) { console.error('❌ MonthlyLimit:', e.message); }
try { require("./models/ApiKey"); console.log('✅ ApiKey'); } catch(e) { console.error('❌ ApiKey:', e.message); }
try { require("./models/ApiKeyLog"); console.log('✅ ApiKeyLog'); } catch(e) { console.error('❌ ApiKeyLog:', e.message); }

console.log('Loading routes...');
try { require("./routes/authRoutes"); console.log('✅ authRoutes'); } catch(e) { console.error('❌ authRoutes:', e.message); }
try { require("./routes/profileRoutes"); console.log('✅ profileRoutes'); } catch(e) { console.error('❌ profileRoutes:', e.message); }
try { require("./routes/bidRoutes"); console.log('✅ bidRoutes'); } catch(e) { console.error('❌ bidRoutes:', e.message); }
try { require("./routes/apiKeyRoutes"); console.log('✅ apiKeyRoutes'); } catch(e) { console.error('❌ apiKeyRoutes:', e.message); }
try { require("./routes/publicRoutes"); console.log('✅ publicRoutes'); } catch(e) { console.error('❌ publicRoutes:', e.message); }

const app = express();

// Middleware
app.use(helmet());

//const allowedOrigins = [
//  'http://localhost:5173', 
// 'http://127.0.0.1:5173',
//  'http://localhost:3000'
//];

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

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

    
    await sequelize.sync({ alter: false }); 
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
