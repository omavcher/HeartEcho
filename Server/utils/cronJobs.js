// utils/cronJobs.js
const cron = require("node-cron");
const User = require("../models/User");

// Reset daily quotas at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    console.log("Resetting daily message quotas...");
    const result = await User.updateMany(
      { user_type: "free" },
      { 
        $set: { messagesUsedToday: 0 },
        $currentDate: { lastQuotaReset: true }
      }
    );
    console.log(`Reset quotas for ${result.modifiedCount} users`);
  } catch (error) {
    console.error("Error resetting quotas:", error);
  }
});

// Check expired subscriptions daily
cron.schedule("0 1 * * *", async () => {
  try {
    console.log("Checking expired subscriptions...");
    const result = await User.checkExpiredSubscriptions();
    console.log(`Updated ${result.modifiedCount} expired subscriptions`);
  } catch (error) {
    console.error("Error checking expired subscriptions:", error);
  }
});