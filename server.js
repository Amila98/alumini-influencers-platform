require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

require("./jobs/winnerSelection");

const User = require("./models/user");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require('./routes/profileRoutes');
const bidRoutes = require("./routes/bidRoutes");

const sequelize = require("./config/db"); // database connection
require("./models/user");
require("./models/Profile");
require("./models/Degree");
require("./models/Certification");
require("./models/Licence");
require("./models/Course");
require("./models/Employment");
require("./models/Bid");
require("./models/MonthlyLimit");


const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

app.get("/", (req, res) => {
  res.send("Alumni Influencer API Running");
});

// DATABASE CONNECTION
sequelize.authenticate()
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch(err => {
    console.error("Database connection failed:", err);
  });

sequelize.sync()
  .then(() => {
    console.log("Database synced");
  })
  .catch(err => {
    console.error("Sync error:", err);
  });


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use("/api/auth", authRoutes);
app.use('/api/profile', profileRoutes);
app.use("/api/bids", bidRoutes);