// server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const axios = require('axios');
const cron = require('node-cron');
const User = require("./models/User");

dotenv.config();
connectDB();

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

const FRONTEND = process.env.FRONTEND || "https://www.heartecho.in";

app.use(cors({
  origin: [
    "https://heartecho.in",
    "https://www.heartecho.in",
    "http://heartecho.in",
    "http://www.heartecho.in",
    "http://localhost:3000"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Website reload configuration
const url = process.env.RELOAD_URL || 'https://heartecho-d851.onrender.com';
const interval = 90000;

function reloadWebsite() {
  axios
    .get(url)
    .then((response) => {
      console.log("website reloaded");
    })
    .catch((error) => {
      console.error(`Error: ${error.message}`);
    });
}

setInterval(reloadWebsite, interval);

app.use(express.json());

// Daily token reset for free users at 00:05 (5 minutes past midnight)
cron.schedule('5 0 * * *', async () => {
  try {
    const now = new Date();
    const resetTime = now.toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      hour12: false 
    });
    
    console.log(`[${resetTime}] Starting automatic daily token reset for free users...`);
    
    // Reset token for all free users
    const result = await User.updateMany(
      { user_type: "free" },
      { 
        $set: { 
          messagesUsedToday: 0,
          lastQuotaReset: now
        }
      }
    );
    
    console.log(`[${resetTime}] Automatic token reset completed. ${result.modifiedCount} free users' tokens reset to 20.`);
    
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in automatic token reset:`, error);
  }
});

// Check expired subscriptions daily at 01:00 (1 AM)
cron.schedule('0 1 * * *', async () => {
  try {
    console.log(`[${new Date().toISOString()}] Checking expired subscriptions...`);
    const result = await User.checkExpiredSubscriptions();
    console.log(`Updated ${result.modifiedCount} expired subscriptions`);
  } catch (error) {
    console.error("Error checking expired subscriptions:", error);
  }
});

// Default API Route
app.get("/api", (req, res) => {
  res.json({      
    success: true,
    message: "Welcome to the HeartEcho 💘💝 API! 🚀",
    version: "2.0.0",
  });
});

// Routes
app.get("/api/v1/api/server-status", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
  });
});

app.use("/api/v1/api/auth", require("./routes/authRoutes"));
app.use("/api/v1/api/user", require("./routes/userRoutes"));
app.use("/api/v1/api/ai", require("./routes/aiRoutes"));
app.use("/api/v1/api/admin", require("./routes/adminRoutes"));
app.use("/api/v1/api/letters", require("./routes/latterRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));