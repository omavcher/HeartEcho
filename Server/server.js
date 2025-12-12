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

// Test cron job - runs every minute
cron.schedule('* * * * *', () => {
  console.log(`[${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}] Cron scheduler is working...`);
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"
});

// Daily token reset for free users at 00:05 IST (5 minutes past midnight IST)
cron.schedule('5 0 * * *', async () => {
  try {
    const now = new Date();
    const istTime = now.toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      hour12: false 
    });
    
    console.log(`\n=== [${istTime}] Starting automatic daily token reset for free users ===`);
    
    // Count users before reset
    const totalFreeUsers = await User.countDocuments({ user_type: "free" });
    console.log(`Total free users: ${totalFreeUsers}`);
    
    // Reset token for all free users
    const result = await User.updateMany(
      { user_type: "free" },
      { 
        $set: { 
          messagesUsedToday: 0,
          lastQuotaReset: now,
          messageQuota: 20
        }
      }
    );
    
    console.log(`[${istTime}] Automatic token reset completed. ${result.modifiedCount} free users' tokens reset to 20.`);
    console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}\n`);
    
  } catch (error) {
    const errorTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    console.error(`[${errorTime}] Error in automatic token reset:`, error.message);
    console.error('Stack trace:', error.stack);
  }
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"
});

// Additional reset at midnight for safety
cron.schedule('0 0 * * *', async () => {
  try {
    const istTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    console.log(`\n[${istTime}] Midnight safety reset triggered...`);
    
    const result = await User.updateMany(
      { user_type: "free" },
      { 
        $set: { 
          messagesUsedToday: 0,
          lastQuotaReset: new Date(),
          messageQuota: 20
        }
      }
    );
    
    console.log(`Midnight safety reset completed: ${result.modifiedCount} users updated\n`);
    
  } catch (error) {
    console.error("Error in midnight safety reset:", error.message);
  }
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"
});

// Check expired subscriptions daily at 01:00 IST
cron.schedule('0 1 * * *', async () => {
  try {
    const istTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    console.log(`\n[${istTime}] Checking expired subscriptions...`);
    
    const result = await User.checkExpiredSubscriptions();
    console.log(`Updated ${result.modifiedCount} expired subscriptions to free users\n`);
    
  } catch (error) {
    console.error("Error checking expired subscriptions:", error.message);
  }
}, {
  scheduled: true,
  timezone: "Asia/Kolkata"
});

// Manual reset endpoint for testing
app.get("/api/v1/api/admin/reset-all-quotas", async (req, res) => {
  try {
    const result = await User.updateMany(
      { user_type: "free" },
      { 
        $set: { 
          messagesUsedToday: 0,
          lastQuotaReset: new Date(),
          messageQuota: 20
        }
      }
    );
    
    res.json({
      success: true,
      message: `Manual quota reset completed. ${result.modifiedCount} free users reset.`,
      modifiedCount: result.modifiedCount,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Reset failed",
      error: error.message
    });
  }
});

// Check quota status endpoint
app.get("/api/v1/api/admin/quota-status", async (req, res) => {
  try {
    const users = await User.find({ user_type: "free" })
      .select('email messagesUsedToday lastQuotaReset messageQuota')
      .limit(10);
    
    const stats = await User.aggregate([
      { $match: { user_type: "free" } },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          avgMessagesUsed: { $avg: "$messagesUsedToday" },
          maxMessagesUsed: { $max: "$messagesUsedToday" },
          usersNeedingReset: {
            $sum: {
              $cond: [{
                $lt: [{ $ifNull: ["$lastQuotaReset", new Date(0)] }, new Date(new Date().setHours(0,0,0,0))]
              }, 1, 0]
            }
          }
        }
      }
    ]);
    
    res.json({
      success: true,
      sampleUsers: users,
      statistics: stats[0] || {},
      serverTime: new Date(),
      istTime: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get quota status",
      error: error.message
    });
  }
});

// Default API Route
app.get("/api", (req, res) => {
  res.json({      
    success: true,
    message: "Welcome to the HeartEcho 💘💝 API! 🚀",
    version: "2.0.0",
    cronStatus: "Active",
    serverTime: new Date(),
    istTime: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
  });
});

// Routes
app.get("/api/v1/api/server-status", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    cronJobs: {
      dailyReset: "00:05 IST",
      subscriptionCheck: "01:00 IST",
      status: "Active"
    }
  });
});

app.use("/api/v1/api/auth", require("./routes/authRoutes"));
app.use("/api/v1/api/user", require("./routes/userRoutes"));
app.use("/api/v1/api/ai", require("./routes/aiRoutes"));
app.use("/api/v1/api/admin", require("./routes/adminRoutes"));
app.use("/api/v1/api/letters", require("./routes/latterRoutes"));
app.use("/api/v1/api/bots" , require("./routes/botsRoutes"))
app.use("/api/v1/api/story" , require("./routes/storyRoutes"))

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n✅ Server running on port ${PORT}`);
  console.log(`⏰ Server time: ${new Date()}`);
  console.log(`🇮🇳 IST time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
  console.log(`🔄 Cron jobs configured for Asia/Kolkata timezone\n`);
});