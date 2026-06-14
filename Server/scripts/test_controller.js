const mongoose = require("mongoose");
require("dotenv").config();
const adminController = require("../controllers/adminController");

const run = async () => {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected.");

  // Find a valid admin/user for mock request
  const user = await mongoose.connection.db.collection("users").findOne();
  if (!user) {
    throw new Error("No user found in the DB to test with.");
  }

  const req = {
    body: { timePeriod: "month" },
    user: { id: user._id.toString() }
  };

  const res = {
    statusCode: null,
    jsonData: null,
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      this.jsonData = data;
      return this;
    }
  };

  console.log("Invoking adminController.dashboardData...");
  const start = Date.now();
  await adminController.dashboardData(req, res);
  const elapsed = Date.now() - start;

  console.log(`Execution complete. Status: ${res.statusCode}. Time: ${elapsed}ms`);
  
  if (res.statusCode !== 200) {
    console.error("Test failed! Res status is not 200:", res.statusCode, res.jsonData);
    process.exit(1);
  }

  console.log("Returned Keys:", Object.keys(res.jsonData));

  // Assert expected keys
  const expectedKeys = [
    "usersData",
    "paymentsData",
    "revenueByCurrency",
    "messageQuotaData",
    "activeUsers",
    "revenueTrend",
    "notifications",
    "countryBreakdown",
    "userMapData",
    "subscriberStats",
    "revenueStats",
    "facebookAdsStats",
    "groupedPricingTiers",
    "userFunnel",
    "retentionStats",
    "heatmapData",
    "chatAnalytics"
  ];

  for (const key of expectedKeys) {
    if (res.jsonData[key] === undefined) {
      console.error(`Assertion failed: key "${key}" is missing from response!`);
      process.exit(1);
    }
  }

  console.log("All assertions passed successfully!");

  await mongoose.disconnect();
};

run().catch(err => {
  console.error("Error in test run:", err);
  process.exit(1);
});
