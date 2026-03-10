require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const sequelize = require("./config/db"); // database connection

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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});