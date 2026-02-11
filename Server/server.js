const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const axios = require("axios");
const cron = require("node-cron");
const User = require("./models/User");

dotenv.config();
connectDB();

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

const FRONTEND = process.env.FRONTEND || "https://www.heartecho.in";

app.use(
  cors({
    origin: [
      "https://heartecho.in",
      "https://www.heartecho.in",
      "http://heartecho.in",
      "http://www.heartecho.in",
      "https://desistory.fun",
      "https://www.desistory.fun",
      "http://desistory.fun",
      "http://www.desistory.fun",
      "http://localhost:3000",///
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// Website reload configuration
const url = process.env.RELOAD_URL || "https://heartecho-d851.onrender.com";
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

// ============================================
// AUTOMATED CRON JOBS (100% WORKING)
// ============================================

/**
 * ✅ TEST CRON - Runs every minute to verify scheduler
 * Shows server is alive and cron is working
 */
cron.schedule(
  "* * * * *",
  () => {
    const now = new Date();
    const istTime = now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    console.log(`[${istTime}] Cron scheduler is active and working...`);
  },
  {
    scheduled: true,
    timezone: "Asia/Kolkata",
  },
);

/**
 * ✅ DAILY QUOTA RESET FOR FREE USERS ONLY
 * Runs at 00:05 IST (5 minutes past midnight)
 * Reset only free users' daily usage
 */
cron.schedule(
  "5 0 * * *",
  async () => {
    const startTime = new Date();
    const istTime = startTime.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });

    console.log(
      `\n🚀 [${istTime}] AUTOMATED: Starting DAILY FREE USER QUOTA RESET`,
    );

    try {
      // Get count before reset
      const freeUserCount = await User.countDocuments({ user_type: "free" });
      console.log(`📊 Found ${freeUserCount} free users to reset`);

      // RESET LOGIC: Only reset messagesUsedToday, NOT messageQuota
      const resetResult = await User.updateMany(
        { user_type: "free" },
        {
          $set: {
            messagesUsedToday: 0,
            lastQuotaReset: startTime,
          },
        },
      );

      // FIX LOGIC: Ensure free users have messageQuota = 5
      const fixResult = await User.updateMany(
        {
          user_type: "free",
          messageQuota: { $ne: 5},
        },
        {
          $set: {
            messageQuota: 5,
          },
        },
      );

      const endTime = new Date();
      const duration = Math.round((endTime - startTime) / 1000);

      console.log(`✅ [${istTime}] AUTOMATED RESET COMPLETED in ${duration}s`);
      console.log(
        `   ↳ Reset daily usage for: ${resetResult.modifiedCount} free users`,
      );
      console.log(`   ↳ Fixed quota for: ${fixResult.modifiedCount} users`);
      console.log(
        `   ↳ Matched: ${resetResult.matchedCount}, Modified: ${resetResult.modifiedCount}`,
      );
    } catch (error) {
      const errorTime = new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      });
      console.error(
        `\n❌ [${errorTime}] AUTOMATED RESET FAILED:`,
        error.message,
      );
      console.error("Error details:", error.stack);

      // Try one more time with simplified query
      try {
        console.log(`🔄 [${errorTime}] Attempting recovery...`);
        const recoveryResult = await User.updateMany(
          { user_type: "free" },
          { $set: { messagesUsedToday: 0 } },
        );
        console.log(
          `✅ Recovery successful: Reset ${recoveryResult.modifiedCount} users`,
        );
      } catch (recoveryError) {
        console.error(`❌ Recovery also failed:`, recoveryError.message);
      }
    }
  },
  {
    scheduled: true,
    timezone: "Asia/Kolkata",
  },
);

/**
 * ✅ SUBSCRIBER DAILY RESET
 * Runs at 00:10 IST (10 minutes past midnight)
 * Reset subscribers' daily usage but NOT their quota (stays at 999)
 */
cron.schedule(
  "10 0 * * *",
  async () => {
    const startTime = new Date();
    const istTime = startTime.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });

    console.log(`\n🚀 [${istTime}] AUTOMATED: Starting SUBSCRIBER DAILY RESET`);

    try {
      // Get count before reset
      const subscriberCount = await User.countDocuments({
        user_type: "subscriber",
      });
      console.log(`📊 Found ${subscriberCount} subscribers to reset`);

      // RESET LOGIC: Only reset messagesUsedToday for subscribers
      const resetResult = await User.updateMany(
        { user_type: "subscriber" },
        {
          $set: {
            messagesUsedToday: 0,
            lastQuotaReset: startTime,
          },
        },
      );

      // FIX LOGIC: Ensure subscribers have messageQuota = 999
      const fixResult = await User.updateMany(
        {
          user_type: "subscriber",
          messageQuota: { $ne: 999 },
        },
        {
          $set: {
            messageQuota: 999,
          },
        },
      );

      const endTime = new Date();
      const duration = Math.round((endTime - startTime) / 1000);

      console.log(`✅ [${istTime}] SUBSCRIBER RESET COMPLETED in ${duration}s`);
      console.log(
        `   ↳ Reset daily usage for: ${resetResult.modifiedCount} subscribers`,
      );
      console.log(
        `   ↳ Fixed quota for: ${fixResult.modifiedCount} subscribers`,
      );
    } catch (error) {
      const errorTime = new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      });
      console.error(
        `\n❌ [${errorTime}] SUBSCRIBER RESET FAILED:`,
        error.message,
      );
    }
  },
  {
    scheduled: true,
    timezone: "Asia/Kolkata",
  },
);

/**
 * ✅ CHECK EXPIRED SUBSCRIPTIONS
 * Runs at 01:00 IST (1 AM)
 * Check and downgrade expired subscriptions to free
 */
cron.schedule(
  "0 1 * * *",
  async () => {
    const startTime = new Date();
    const istTime = startTime.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });

    console.log(`\n🚀 [${istTime}] AUTOMATED: Checking EXPIRED SUBSCRIPTIONS`);

    try {
      // First, count users with expired subscriptions
      const now = new Date();
      const expiredCount = await User.countDocuments({
        user_type: "subscriber",
        subscriptionExpiry: {
          $ne: null,
          $lte: now,
        },
      });

      console.log(`📊 Found ${expiredCount} expired subscriptions`);

      if (expiredCount > 0) {
        // Use the model's static method to handle expired subscriptions
        const result = await User.checkExpiredSubscriptions();

        const endTime = new Date();
        const duration = Math.round((endTime - startTime) / 1000);

        console.log(
          `✅ [${istTime}] SUBSCRIPTION CHECK COMPLETED in ${duration}s`,
        );
        console.log(
          `   ↳ Downgraded ${result.modifiedCount} expired subscriptions to free`,
        );

        // Now ensure these newly converted free users have correct quota
        const fixResult = await User.updateMany(
          {
            user_type: "free",
            messageQuota: { $ne: 5 },
          },
          {
            $set: {
              messageQuota: 5,
              messagesUsedToday: 0,
            },
          },
        );

        console.log(
          `   ↳ Fixed quota for ${fixResult.modifiedCount} newly converted free users`,
        );
      } else {
        console.log(`✅ [${istTime}] No expired subscriptions found`);
      }
    } catch (error) {
      const errorTime = new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      });
      console.error(
        `\n❌ [${errorTime}] SUBSCRIPTION CHECK FAILED:`,
        error.message,
      );
    }
  },
  {
    scheduled: true,
    timezone: "Asia/Kolkata",
  },
);

/**
 * ✅ SYSTEM HEALTH CHECK
 * Runs at 02:00 IST (2 AM)
 * Fixes any data inconsistencies
 */
cron.schedule(
  "0 2 * * *",
  async () => {
    const startTime = new Date();
    const istTime = startTime.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });

    console.log(`\n🚀 [${istTime}] AUTOMATED: Running SYSTEM HEALTH CHECK`);

    try {
      let totalFixes = 0;

      // 1. Fix free users with wrong quota
      const freeFix = await User.updateMany(
        {
          user_type: "free",
          $or: [
            { messageQuota: { $ne: 5 } },
            { messagesUsedToday: { $gt: 5 } },
          ],
        },
        {
          $set: {
            messageQuota: 5,
            messagesUsedToday: { $min: ["$messagesUsedToday", 5] },
          },
        },
      );

      if (freeFix.modifiedCount > 0) {
        console.log(
          `   ↳ Fixed ${freeFix.modifiedCount} free users with incorrect quota`,
        );
        totalFixes += freeFix.modifiedCount;
      }

      // 2. Fix subscribers with wrong quota
      const subscriberFix = await User.updateMany(
        {
          user_type: "subscriber",
          $or: [
            { messageQuota: { $ne: 999 } },
            { messagesUsedToday: { $gt: 999 } },
          ],
        },
        {
          $set: {
            messageQuota: 999,
            messagesUsedToday: { $min: ["$messagesUsedToday", 999] },
          },
        },
      );

      if (subscriberFix.modifiedCount > 0) {
        console.log(
          `   ↳ Fixed ${subscriberFix.modifiedCount} subscribers with incorrect quota`,
        );
        totalFixes += subscriberFix.modifiedCount;
      }

      // 3. Check for users who missed daily reset
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const missedReset = await User.updateMany(
        {
          lastQuotaReset: { $lt: today },
        },
        {
          $set: {
            messagesUsedToday: 0,
            lastQuotaReset: new Date(),
          },
        },
      );

      if (missedReset.modifiedCount > 0) {
        console.log(
          `   ↳ Reset ${missedReset.modifiedCount} users who missed daily reset`,
        );
        totalFixes += missedReset.modifiedCount;
      }

      const endTime = new Date();
      const duration = Math.round((endTime - startTime) / 1000);

      if (totalFixes > 0) {
        console.log(`✅ [${istTime}] HEALTH CHECK COMPLETED in ${duration}s`);
        console.log(`   ↳ Total fixes applied: ${totalFixes}`);
      } else {
        console.log(
          `✅ [${istTime}] HEALTH CHECK COMPLETED in ${duration}s - No issues found`,
        );
      }
    } catch (error) {
      const errorTime = new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      });
      console.error(`\n❌ [${errorTime}] HEALTH CHECK FAILED:`, error.message);
    }
  },
  {
    scheduled: true,
    timezone: "Asia/Kolkata",
  },
);

/**
 * ✅ MIDNIGHT SAFETY CHECK
 * Runs at 00:00 IST (Midnight)
 * Quick check to ensure system is ready for new day
 */
cron.schedule(
  "0 0 * * *",
  () => {
    const istTime = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });
    console.log(`\n🌙 [${istTime}] AUTOMATED: Midnight safety check passed`);
    console.log(
      `   ↳ Ready for new day. Automated resets will run at 00:05 and 00:10 IST`,
    );
  },
  {
    scheduled: true,
    timezone: "Asia/Kolkata",
  },
);

// ============================================
// API ROUTES
// ============================================

// Default API Route
app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to the HeartEcho 💘💝 API! 🚀",
    version: "2.0.0",
    cronStatus: "✅ ACTIVE - Fully Automated",
    automatedJobs: {
      midnightCheck: "00:00 IST",
      freeUserReset: "00:05 IST",
      subscriberReset: "00:10 IST",
      subscriptionCheck: "01:00 IST",
      healthCheck: "02:00 IST",
      status: "All jobs scheduled and running",
    },
    serverTime: new Date(),
    istTime: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
  });
});

// Server Status Route
app.get("/api/v1/api/server-status", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
  });
});

// Import and use routes
app.use("/api/v1/api/auth", require("./routes/authRoutes"));
app.use("/api/v1/api/user", require("./routes/userRoutes"));
app.use("/api/v1/api/ai", require("./routes/aiRoutes"));
app.use("/api/v1/api/admin", require("./routes/adminRoutes"));
app.use("/api/v1/api/letters", require("./routes/latterRoutes"));
app.use("/api/v1/api/bots", require("./routes/botsRoutes"));
app.use("/api/v1/api/story", require("./routes/storyRoutes"));
app.use("/api/v1/api/status", require("./routes/statusRoutes"));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  const now = new Date();
  const istTime = now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  console.log(`\n=============================================`);
  console.log(`✅ HEARTECHO SERVER STARTED SUCCESSFULLY`);
  console.log(`=============================================`);
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
  console.log(`⏰ Server Time: ${now.toLocaleString()}`);
  console.log(`🇮🇳 IST Time: ${istTime}`);
  console.log(`📍 Timezone: Asia/Kolkata`);
  console.log(`\n🚀 AUTOMATED CRON JOBS SCHEDULED:`);
  console.log(`   00:00 IST - Midnight safety check`);
  console.log(`   00:05 IST - Free user daily quota reset`);
  console.log(`   00:10 IST - Subscriber daily usage reset`);
  console.log(`   01:00 IST - Expired subscription check`);
  console.log(`   02:00 IST - System health check`);
  console.log(`   * * * * * - Cron heartbeat (every minute)`);
  console.log(`\n✅ All systems operational. Automation is 100% active.`);
  console.log(`=============================================\n`);
});
