const mongoose = require("mongoose");
const User = require("../models/User");
const AIFriend = require("../models/AIFriend");
const Chat = require("../models/Chat");
const LoginDetail = require("../models/LoginDetail");
const Ticket = require("../models/Ticket");
const Payment = require("../models/Payment");
const TrackingEvent = require("../models/TrackingEvent");
const moment = require("moment");
require("dotenv").config();
const PrebuiltAIFriend = require("../models/PrebuiltAIFriend");
const DeletedAccount = require("../models/DeletedAccount");
const ReferralCreator = require("../models/ReferralCreator");
const { generateCreatorToken, verifyReferralCreator } = require('../utils/jwt');
const { sendPushNotification, sendMulticastNotification, sendEachPersonalizedNotification } = require("../utils/notificationService");
const NotificationLog = require("../models/NotificationLog");
const Feedback = require("../models/Feedback");
const { getCityFromCoordinates, isStateName } = require("../utils/geocoding");

// Get all deleted accounts

exports.getDeletedAccounts = async (req, res) => {
  try {
    const deletedAccounts = await DeletedAccount.find().sort({ deletedAt: -1 });
    res.status(200).json({ success: true, data: deletedAccounts });
  } catch (error) {
    console.error("Error fetching deleted accounts:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get today's key indicators
exports.getTodayIndicators = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    
    const todayQuery = { $gte: startOfToday, $lte: endOfToday };

    const [
      newUsers,
      newComplaints,
      newReferrals,
      newLogins,
      newPayments,
      newDeletedAccounts
    ] = await Promise.all([
      User.countDocuments({ createdAt: todayQuery }),
      Ticket.countDocuments({ date: todayQuery }),
      ReferralCreator.countDocuments({ createdAt: todayQuery }),
      LoginDetail.countDocuments({ time: todayQuery }),
      Payment.countDocuments({ date: todayQuery }),
      DeletedAccount.countDocuments({ deletedAt: todayQuery })
    ]);

    res.status(200).json({
      success: true,
      data: {
        users: newUsers,
        complaints: newComplaints,
        referrals: newReferrals,
        logins: newLogins,
        payments: newPayments,
        deletedAccounts: newDeletedAccounts,
      }
    });
  } catch (error) {
    console.error("Error fetching today indicators:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.manualSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        const { password, tier } = req.body;

        if (password !== "omjs2693") {
            return res.status(401).json({ success: false, message: "Invalid Admin Password" });
        }

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const plans = {
            monthly: { days: 30, quota: 0 },
            yearly: { days: 365, quota: 999999 },
            yearly_pro: { days: 365, quota: 999999 }
        };

        if (!plans[tier]) return res.status(400).json({ success: false, message: "Invalid tier" });

        user.user_type = "subscriber";
        user.subscriptionTier = tier;
        user.audioCallQuota = plans[tier].quota;
        
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + plans[tier].days);
        user.subscriptionExpiry = expiry;

        await user.save();
        res.status(200).json({ success: true, message: `Subscribed user to ${tier}` });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const migrateOldLoginDetails = async () => {
    try {
        const recordsToFix = await LoginDetail.find({
            "coordinates.lat": { $exists: true, $ne: null },
            "coordinates.lon": { $exists: true, $ne: null },
            $or: [
                { cityName: { $exists: false } },
                { cityName: null },
                { cityName: "" },
                { cityName: "Unknown" }
            ]
        }).limit(100);

        let updatedCount = 0;
        for (const record of recordsToFix) {
            const { lat, lon } = record.coordinates;
            const currentCity = record.cityName || record.location || "";
            if (!record.cityName || isStateName(currentCity) || currentCity === "Unknown") {
                const geo = await getCityFromCoordinates(lat, lon);
                if (geo && geo.cityName && geo.cityName !== "Unknown") {
                    record.cityName = geo.cityName;
                    if (geo.country && geo.country !== "Unknown") {
                        record.country = geo.country;
                    }
                    await record.save();
                    updatedCount++;
                }
            }
        }
        if (updatedCount > 0) {
            console.log(`[Migration] Updated ${updatedCount} LoginDetail records with correct city names.`);
        }
    } catch (err) {
        console.error("[Migration] Error migrating old login detail records:", err.message);
    }
};

exports.dashboardData = async (req, res) => {
  try {
      const userId = req.user.id;

      // Total users ever registered
      const usersData = await User.countDocuments();

      // Total revenue ever (grouped by currency)
      const paymentsData = await Payment.aggregate([
          { $group: { _id: "$currency", totalRevenue: { $sum: "$rupees" } } }
      ]);
      const revenueByCurrency = paymentsData.reduce((acc, curr) => {
          acc[curr._id || "INR"] = curr.totalRevenue;
          return acc;
      }, { INR: 0, USD: 0 });
      
      // Estimated total in INR for summary (assuming 1 USD = 83 INR)
      const totalRevenue = revenueByCurrency.INR + (revenueByCurrency.USD * 83);

      // Total messages sent by all users
      const messageQuotaData = await Chat.aggregate([
          { $unwind: "$messages" },
          { $match: { "messages.senderModel": "User" } },
          { $group: { _id: "$messages.sender", totalMessages: { $sum: 1 } } },
          { $sort: { totalMessages: -1 } }
      ]);
      const totalMessages = messageQuotaData.reduce((sum, u) => sum + u.totalMessages, 0);

      // Total unique active users (all time)
      const activeUsersData = await LoginDetail.aggregate([
          { $group: { _id: "$user" } },
          { $count: "totalActiveUsers" }
      ]);
      const totalActiveUsers = activeUsersData.length > 0 ? activeUsersData[0].totalActiveUsers : 0;

      // Revenue trend over time (lifetime daily trend)
      const revenueTrend = await Payment.aggregate([
          { 
              $group: { 
                  _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, 
                  totalInINR: { 
                    $sum: {
                      $cond: [
                        { $eq: ["$currency", "USD"] },
                        { $multiply: ["$rupees", 83] },
                        "$rupees"
                      ]
                    }
                  } 
              } 
          },
          { $sort: { _id: 1 } }
      ]);

      // Latest 10 AI friends created (lifetime)
      const notifications = await AIFriend.find().sort({ createdAt: -1 }).limit(10);

      // User breakdown by country
      const countryBreakdown = await User.aggregate([
          { $group: { _id: "$country", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
      ]);

      const formattedCountryBreakdown = countryBreakdown.map(item => ({
          country: item._id || "Unknown",
          count: item.count,
          percentage: ((item.count / usersData) * 100).toFixed(1)
      }));

      // Get map data showing active users' locations and coordinate centers
      // Use cityName field (new) with fallback to location field (legacy)
      const userMapData = await LoginDetail.aggregate([
          { $match: { 
              "coordinates.lat": { $exists: true, $ne: null }, 
              "coordinates.lon": { $exists: true, $ne: null }
          }},
          { $sort: { time: -1 } },
          { $group: {
              _id: "$user",
              lat: { $first: "$coordinates.lat" },
              lon: { $first: "$coordinates.lon" },
              cityName: { $first: { $ifNull: ["$cityName", "$location"] } },
              country: { $first: "$country" }
          } },
          // Filter out users with no valid city
          { $match: { 
              cityName: { $nin: [null, "", "Unknown"] }
          }},
          // Group by city (case-insensitive)
          { $group: {
              _id: { $toLower: "$cityName" },
              cityName: { $first: "$cityName" },
              country: { $first: "$country" },
              lat: { $avg: "$lat" },
              lon: { $avg: "$lon" },
              count: { $sum: 1 }
          } },
          { $sort: { count: -1 } },
          { $limit: 50 }
      ]);

      // Post-process map data to resolve any state-level names or "Unknown" to proper city names
      const cityGroups = {};
      for (const item of (userMapData || [])) {
          let name = item.cityName;
          let country = item.country;
          const lat = item.lat;
          const lon = item.lon;

          if (isStateName(name) || name === "Unknown" || !name) {
              const geo = await getCityFromCoordinates(lat, lon);
              if (geo && geo.cityName && geo.cityName !== "Unknown") {
                  name = geo.cityName;
                  if (geo.country && geo.country !== "Unknown") {
                      country = geo.country;
                  }
              }
          }

          // Group by city name case-insensitively to combine duplicates after geocoding
          const key = (name || "Unknown").toLowerCase().trim();
          if (cityGroups[key]) {
              const prevCount = cityGroups[key].count;
              cityGroups[key].count += item.count;
              // Average coordinates of the grouped entries weighted by count
              cityGroups[key].lat = (cityGroups[key].lat * prevCount + lat * item.count) / cityGroups[key].count;
              cityGroups[key].lon = (cityGroups[key].lon * prevCount + lon * item.count) / cityGroups[key].count;
          } else {
              cityGroups[key] = {
                  _id: key,
                  cityName: name || "Unknown",
                  country: country || "Unknown",
                  lat: lat,
                  lon: lon,
                  count: item.count
              };
          }
      }

      let finalUserMapData = Object.values(cityGroups).sort((a, b) => b.count - a.count);

      // Trigger background migration asynchronously to heal DB records
      migrateOldLoginDetails().catch(err => console.error("Migration call error:", err));

      return res.status(200).json({
          usersData,
          paymentsData: totalRevenue,
          revenueByCurrency,
          messageQuotaData: totalMessages,
          activeUsers: totalActiveUsers,
          revenueTrend,
          notifications,
          countryBreakdown: formattedCountryBreakdown,
          userMapData: finalUserMapData
      });

  } catch (error) {
      console.error("Error fetching dashboard data:", error);
      return res.status(500).json({ error: "Internal server error" });
  }
};





exports.getUsersBreakdown = async (req, res) => {
    try {
        // Execute all aggregations in parallel using Promise.all
        const [
            roleBreakdown,
            paymentsData,
            messageQuota,
            activeUsersCount,
            revenueTrend,
            engagementData
        ] = await Promise.all([
            // Role breakdown
            User.aggregate([
                { $group: { _id: "$role", count: { $sum: 1 } } }
            ]),

            // Payments data
            Payment.find(),

            // Message quota usage
            Chat.aggregate([
                { $unwind: "$messages" },
                { $group: { _id: "$messages.sender", count: { $sum: 1 } } },
                { $lookup: { 
                    from: "users", 
                    localField: "_id", 
                    foreignField: "_id", 
                    as: "user" 
                } },
                { $project: { 
                    user: { $arrayElemAt: ["$user", 0] }, 
                    count: 1 
                } }
            ]),

            // Active users count
            User.find({ isActive: true }).countDocuments(),

            // Revenue trend
            Payment.aggregate([
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                        totalRevenue: { $sum: "$rupees" }
                    }
                },
                { $sort: { _id: 1 } }
            ]),

            // User engagement
            User.aggregate([
                {
                    $lookup: {
                        from: "chats",
                        localField: "_id",
                        foreignField: "participants",
                        as: "userChats"
                    }
                },
                {
                    $lookup: {
                        from: "payments",
                        localField: "_id",
                        foreignField: "user",
                        as: "userPayments"
                    }
                },
                {
                    $lookup: {
                        from: "logindetails",
                        localField: "_id",
                        foreignField: "user",
                        as: "userLogins"
                    }
                },
                {
                    $project: {
                        name: 1,
                        email: 1,
                        totalMessages: { $size: "$userChats" },
                        totalPayments: { $size: "$userPayments" },
                        totalLogins: { $size: "$userLogins" }
                    }
                }
            ])
        ]);

        // Combine all results into a single response object
        const response = {
            roleBreakdown,
            payments: paymentsData,
            messageQuota,
            activeUsers: activeUsersCount,
            revenueTrend,
            userEngagement: engagementData,
            timestamp: new Date()
        };

        res.json(response);
    } catch (err) {
        res.status(500).json({ 
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};


exports.getUserDataAdmin = async (req, res) => {
    try {
        // 1. Get login counts per date (counting unique users per day)
        const loginStats = await LoginDetail.aggregate([
            // Group by date (ignoring time) and user to count unique logins per user per day
            {
                $group: {
                    _id: {
                        date: {
                            $dateToString: { format: "%Y-%m-%d", date: "$time" }
                        },
                        user: "$user"
                    }
                }
            },
            // Group again by just date to count total unique users per day
            {
                $group: {
                    _id: "$_id.date",
                    loginCount: { $sum: 1 }
                }
            },
            // Sort by date
            {
                $sort: { _id: 1 }
            },
            // Format the output
            {
                $project: {
                    date: "$_id",
                    loginCount: 1,
                    _id: 0
                }
            }
        ]);

        // 2. Get user type counts
        const userTypeStats = await User.aggregate([
            {
                $group: {
                    _id: "$user_type",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Format user type stats into an object
        const userStats = {
            subscribers: 0,
            free: 0
        };

        userTypeStats.forEach(stat => {
            if (stat._id === "subscriber") {
                userStats.subscribers = stat.count;
            } else if (stat._id === "free") {
                userStats.free = stat.count;
            }
        });

        // Combine all data into response
        const responseData = {
            loginStats: loginStats,
            userStats: {
                totalSubscribers: userStats.subscribers,
                totalFreeMembers: userStats.free,
                totalUsers: userStats.subscribers + userStats.free
            }
        };

        return res.status(200).json({
            success: true,
            data: responseData
        });

    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        return res.status(500).json({ 
            success: false,
            error: "Internal server error" 
        });
    }
};

exports.UserALLDtaa = async (req,res) =>{
  try {
    const userData = await User.find({}).sort({ createdAt: -1 });

    // Calculate today's start and end dates
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: startOfToday, $lte: endOfToday }
    });

    const uniqueLoginsToday = await LoginDetail.distinct("user", {
      time: { $gte: startOfToday, $lte: endOfToday }
    });
    
    const todaySignIns = uniqueLoginsToday.length;

     return res.status(200).json({
        userData,
        newUsersToday,
        todaySignIns
        });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
        return res.status(500).json({ 
            success: false,
            error: "Internal server error" 
        });
  }

}


exports.aiAllModelData = async (req, res) => {
  try {
    const aiusers = await PrebuiltAIFriend.aggregate([
      {
        $lookup: {
          from: "chats",
          let: { friendId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ["$aiParticipants", "$$friendId"] },
                    {
                      $and: [
                        { $isArray: "$aiParticipants" },
                        { $in: ["$$friendId", "$aiParticipants"] }
                      ]
                    }
                  ]
                }
              }
            },
            {
              $lookup: {
                from: "users",
                localField: "participants",
                foreignField: "_id",
                as: "user"
              }
            },
            {
              $unwind: {
                path: "$user",
                preserveNullAndEmptyArrays: false
              }
            },
            {
              $match: {
                "user.email": { $ne: "omawchar07@gmail.com" }
              }
            },
            {
              $unwind: "$messages"
            },
            {
              $match: {
                "messages.senderModel": "User"
              }
            },
            {
              $count: "count"
            }
          ],
          as: "messageStats"
        }
      },
      {
        $addFields: {
          messageCount: { $ifNull: [{ $arrayElemAt: ["$messageStats.count", 0] }, 0] }
        }
      },
      {
        $project: {
          messageStats: 0
        }
      },
      { $sort: { messageCount: -1 } }
    ]);

    return res.status(200).json({
      aiusers
    });
  } catch (error) {
    console.error("Error fetching AI friend data with stats:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
};




  exports.PutAIFrindData = async (req, res) => {
    try {
      // Ensure the request body is an array of AI friend objects
      const aiFriendData = req.body;
  
      // Validate that data is provided and is an array
      if (!Array.isArray(aiFriendData) || aiFriendData.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid or empty data. Please provide an array of AI friend objects.",
        });
      }
  
      // Insert data into MongoDB
      const insertedData = await PrebuiltAIFriend.insertMany(aiFriendData);
  
      res.status(201).json({
        success: true,
        message: "AI Friend data inserted successfully!",
        data: insertedData,
      });
    } catch (error) {
      console.error("Error inserting AI Friend data:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  };


  exports.deleteAIFriend = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Validate the ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid AI Friend ID",
        });
      }
  
      // Find and delete the AI Friend
      const deletedFriend = await PrebuiltAIFriend.findByIdAndDelete(id);
  
      if (!deletedFriend) {
        return res.status(404).json({
          success: false,
          message: "AI Friend not found",
        });
      }
  
      res.status(200).json({
        success: true,
        message: "AI Friend deleted successfully",
        data: deletedFriend,
      });
    } catch (error) {
      console.error("Error deleting AI Friend:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  };
  
  // Create a single Prebuilt AI Friend
  exports.createAIFriend = async (req, res) => {
    try {
      const data = req.body;
      
      // Validate required fields
      const requiredFields = ["gender", "relationship", "age", "name"];
      for (const field of requiredFields) {
        if (!(field in data) || !data[field]) {
          return res.status(400).json({
            success: false,
            message: `Missing or invalid required field: ${field}`,
          });
        }
      }

      const newFriend = new PrebuiltAIFriend(data);
      await newFriend.save();

      res.status(201).json({
        success: true,
        message: "AI Friend created successfully",
        data: newFriend,
      });
    } catch (error) {
      console.error("Error creating AI Friend:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  };

  // Edit (Update) a Prebuilt AI Friend
  exports.updateAIFriend = async (req, res) => {
    try {
      const { id } = req.params;
      const updatedData = req.body;
  
      // Validate the ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid AI Friend ID",
        });
      }
  
      // Validate required fields
      const requiredFields = ["gender", "relationship", "age", "name"];
      for (const field of requiredFields) {
        if (!(field in updatedData) || !updatedData[field]) {
          return res.status(400).json({
            success: false,
            message: `Missing or invalid required field: ${field}`,
          });
        }
      }
  
      // Ensure gender is valid
      if (!["male", "female", "other"].includes(updatedData.gender)) {
        return res.status(400).json({
          success: false,
          message: "Gender must be 'male', 'female', or 'other'",
        });
      }
  
      // Update the AI Friend
      const updatedFriend = await PrebuiltAIFriend.findByIdAndUpdate(
        id,
        updatedData,
        { new: true, runValidators: true } // Return the updated document and run schema validators
      );
  
      if (!updatedFriend) {
        return res.status(404).json({
          success: false,
          message: "AI Friend not found",
        });
      }
  
      res.status(200).json({
        success: true,
        message: "AI Friend updated successfully",
        data: updatedFriend,
      });
    } catch (error) {
      console.error("Error updating AI Friend:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  };
  
  // Your existing PutAIFrindData (included for completeness)
  exports.PutAIFrindData = async (req, res) => {
    try {
      const aiFriendData = req.body;
  
      if (!Array.isArray(aiFriendData) || aiFriendData.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid or empty data. Please provide an array of AI friend objects.",
        });
      }
  
      const insertedData = await PrebuiltAIFriend.insertMany(aiFriendData);
  
      res.status(201).json({
        success: true,
        message: "AI Friend data inserted successfully!",
        data: insertedData,
      });
    } catch (error) {
      console.error("Error inserting AI Friend data:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  };



  const Complaint = require("../models/Ticket");

  exports.getAllTickets = async (req, res) => {
    try {
      // Fetch all tickets and populate user details perfectly
      const tickets = await Complaint.find()
        .populate("user", "name email phone_number gender age user_type subscriptionTier joinedAt")
        .sort({ date: -1 })
        .lean();
  
      res.status(200).json({
        success: true,
        data: tickets,
      });
    } catch (error) {
      console.error("Error fetching tickets:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  };
  
  // Delete a ticket (unchanged)
  exports.deleteTicket = async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid Ticket ID" });
      }
      const deletedTicket = await Complaint.findByIdAndDelete(id);
      if (!deletedTicket) {
        return res.status(404).json({ success: false, message: "Ticket not found" });
      }
      res.status(200).json({
        success: true,
        message: "Ticket deleted successfully",
        data: deletedTicket,
      });
    } catch (error) {
      console.error("Error deleting ticket:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  };
  
  // Update a ticket (unchanged)
  exports.updateTicket = async (req, res) => {
    try {
      const { id } = req.params;
      const updatedData = req.body;
  
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid Ticket ID" });
      }
  
      const requiredFields = ["user", "issue"];
      for (const field of requiredFields) {
        if (!(field in updatedData) || !updatedData[field]) {
          return res.status(400).json({ success: false, message: `Missing or invalid required field: ${field}` });
        }
      }
  
      if (!mongoose.Types.ObjectId.isValid(updatedData.user)) {
        return res.status(400).json({ success: false, message: "Invalid User ID" });
      }
  
      if (updatedData.status && !["Pending", "Resolved"].includes(updatedData.status)) {
        return res.status(400).json({ success: false, message: "Status must be 'Pending' or 'Resolved'" });
      }
  
      const updatedTicket = await Complaint.findByIdAndUpdate(
        id,
        updatedData,
        { new: true, runValidators: true }
      );
  
      if (!updatedTicket) {
        return res.status(404).json({ success: false, message: "Ticket not found" });
      }
  
      // Fetch user name for the updated ticket
      const user = await User.findById(updatedTicket.user, "name");
      const ticketWithUserName = {
        ...updatedTicket.toObject(),
        userName: user ? user.name : "Unknown",
      };
  
      res.status(200).json({
        success: true,
        message: "Ticket updated successfully",
        data: ticketWithUserName,
      });
    } catch (error) {
      console.error("Error updating ticket:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  };

// ============================================================
// AI SUGGEST REPLY FOR COMPLAINT TICKET (OpenRouter free models)
// ============================================================
exports.getAiSuggestReply = async (req, res) => {
  try {
    const { issue, userName, tier, ticketId } = req.body;

    if (!issue) {
      return res.status(400).json({ success: false, message: "Issue text is required" });
    }

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) {
      return res.status(500).json({ success: false, message: "OpenRouter API key not configured" });
    }

const systemPrompt = `You are an expert customer support agent for HeartEcho — a premium AI companion app. Your communication style must be tailored for Indian users: polite, highly direct, reassuring, and brief. Do not use overly flowery, long, or dramatic apologies. Get straight to the solution.

=== ABOUT HEARTECHO ===
HeartEcho lets users form emotional bonds with AI characters.
- Available on Android, and web (heartecho.in)
- Features: Chat, Live Story (Yearly/Yearly Pro only), Letter AI, Voice Calls (Yearly/Yearly Pro only)

=== SUBSCRIPTION PLANS ===
FREE: 5 messages/day (resets midnight IST).
MONTHLY (~₹99/mo): Unlimited msgs, full Live Story. No voice calls.
YEARLY (~₹599/yr): Unlimited msgs, 30 min/day voice calls, full Live Story.
YEARLY PRO (~₹1499/yr): Unlimited msgs, unlimited voice calls, everything unlocked.

=== RESOLUTION GUIDE ===
1. PAYMENT DONE BUT PLAN NOT ACTIVE:
Tell them: Their money is 100% safe. Ask them to force-close and reopen the app. If it's not active in 30 mins, our team will manually activate it.

2. AI SAYING "TAKE PREMIUM" EVEN AFTER PAYMENT:
Tell them: Log out completely and log back in to refresh the account. If it still fails, our team will manually activate it shortly.

3. AI NOT REPLYING / INCOMPLETE MESSAGES:
Tell them: Clear the app cache (Settings > Apps > HeartEcho > Clear Cache) and reopen. This is a known bug being fixed, and a reset usually solves it.

4. LIVE STORY NOT ACCESSIBLE:
Monthly users don't get Live Story. If they have Yearly/Pro: ask them to logout and login again to fix it.

5. AI SENDING RANDOM MESSAGES:
Tell them: Tap the 3-dot menu in the chat and select "Clear Chat" or "Reset Conversation" to refresh the AI's memory.

6. VOICE CALLS NOT WORKING:
Monthly users don't get voice. For Yearly: ensure microphone permissions are ON and internet is stable.

7. PAYMENT FAILING (VISA/INTERNATIONAL):
Tell them: Use the PayPal option on the subscription screen. If missing, email heartecho.help@gmail.com for a direct link. 

8. APP CRASHING:
Tell them: Update the app and clear the cache. Reinstalling is safe as chat history is saved on our servers.

9. LOGIN ISSUES:
Tell them: Use "Forgot Password". If OTP is missing, check the spam folder.

=== STRICT REPLY RULES ===
- Address the user by their name (e.g., "Hi Rajesh,").
- Keep replies VERY SHORT, punchy, and direct (Target: 30 to 70 words).
- Give the exact solution immediately. Do not write long paragraphs.
- If it is a payment issue, ALWAYS state clearly: "Please don't worry, your money is 100% safe."
- Write in plain, simple English. No bullet points, markdown, or headers in the reply text.
- NEVER use placeholders like [Name] or <insert here>.
- End EVERY single reply exactly with: — HeartEcho Support Team 💜`;

    const userPrompt = `Ticket ID: #${ticketId || "N/A"}
User Name: ${userName || "User"}
Current Plan: ${tier || "free"}
User Complaint: "${issue}"

Write a warm, specific, helpful support reply addressing this exact complaint using the knowledge above. Remember to end with — HeartEcho Support Team 💜`;

    // Try free models in order (verified working on OpenRouter)
    const freeModels = [
      "qwen/qwen3-coder:free",
      "google/gemma-4-31b-it:free",
      "openrouter/free",
      "meta-llama/llama-3.3-70b-instruct:free",
      "meta-llama/llama-3.2-3b-instruct:free"
    ];

    let aiReply = null;
    let lastError = null;

    for (const model of freeModels) {
      try {
        console.log(`🤖 Trying OpenRouter model: ${model}`);
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://www.heartecho.in",
            "X-Title": "HeartEcho Admin Support"
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            max_tokens: 200,
            temperature: 0.7,
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          console.warn(`⚠️ Model ${model} failed: ${response.status} - ${errText}`);
          lastError = errText;
          continue;
        }

        const data = await response.json();
        if (data.choices && data.choices[0]?.message?.content) {
          aiReply = data.choices[0].message.content.trim();
          console.log(`✅ AI reply generated with model: ${model}`);
          break;
        }
      } catch (modelErr) {
        console.warn(`⚠️ Model ${model} error:`, modelErr.message);
        lastError = modelErr.message;
        continue;
      }
    }

    if (!aiReply) {
      // Fallback default reply
      aiReply = `Hi ${userName || "there"}, thank you for reaching out! We've reviewed your issue and our team is looking into it right away. Please try restarting the app and if the issue persists, we'll resolve it within 24 hours. — HeartEcho Support Team`;
    }

    return res.status(200).json({ success: true, reply: aiReply });
  } catch (error) {
    console.error("Error generating AI reply:", error);
    return res.status(500).json({ success: false, message: "Failed to generate AI reply", error: error.message });
  }
};

// ============================================================
// SEND EMAIL REPLY TO COMPLAINT USER
// ============================================================
exports.sendTicketEmailReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminReply } = req.body;

    if (!adminReply || adminReply.trim() === "") {
      return res.status(400).json({ success: false, message: "Admin reply text is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid Ticket ID" });
    }

    const ticket = await Complaint.findById(id)
      .populate("user", "name email subscriptionTier _id")
      .lean();

    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    const user = ticket.user;
    if (!user || !user.email) {
      return res.status(400).json({ success: false, message: "User email not found for this ticket" });
    }

    const ticketIdShort = id.toString().substring(0, 8);
    const dateStr = new Date(ticket.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    const tierDisplay = user.subscriptionTier === "none" ? "Free" : 
                        user.subscriptionTier === "monthly" ? "Monthly" :
                        user.subscriptionTier === "yearly" ? "Yearly" :
                        user.subscriptionTier === "yearly_pro" ? "Yearly Pro" : "Free";

    // Build the branded email HTML
    const emailHtml = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Support Ticket Update - HeartEcho</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
    html, body { margin: 0; padding: 0; height: 100%; width: 100%; -webkit-text-size-adjust: 100%; background-color: #120524; }
    * { box-sizing: border-box; }
    body { font-family: 'DM Sans', -apple-system, sans-serif; color: #e2d8f0; padding: 20px 10px; font-size: 14px; line-height: 1.6; }
    .container { max-width: 540px; margin: 0 auto; background-color: #0f0620; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden; }
    .header { background-color: #160a2b; padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; }
    .brand { font-weight: 600; font-size: 16px; color: #fff; }
    .brand span { color: #ff4099; }
    .ticket-id { font-size: 13px; color: #a395b5; }
    .content { padding: 24px; }
    .greeting { font-size: 16px; font-weight: 500; color: #fff; margin-bottom: 16px; }
    .ticket-info { background: rgba(255,255,255,0.02); border-radius: 8px; padding: 16px; margin-bottom: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px; }
    .info-item { color: #a395b5; }
    .info-item strong { color: #fff; font-weight: 500; }
    .status-badge { background: rgba(233,30,140,0.15); color: #ff6b9d; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .thread { margin-bottom: 24px; }
    .message-block { margin-bottom: 16px; padding: 16px; border-radius: 8px; }
    .message-header { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
    .msg-user { background: rgba(255,255,255,0.03); border-left: 3px solid #5a4b70; }
    .msg-user .message-header { color: #a395b5; }
    .msg-user p { margin: 0; color: #cfc2df; font-style: italic; }
    .msg-admin { background: linear-gradient(180deg, rgba(233,30,140,0.05) 0%, rgba(233,30,140,0.01) 100%); border-left: 3px solid #e91e8c; }
    .msg-admin .message-header { color: #ff6b9d; }
    .msg-admin p { margin: 0; color: #fff; }
    .footer { background-color: #160a2b; padding: 20px 24px; border-top: 1px solid rgba(255,255,255,0.05); font-size: 13px; color: #a395b5; text-align: center; }
    .help-box { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); padding: 12px; border-radius: 6px; margin-bottom: 12px; }
    .footer a { color: #ff6b9d; text-decoration: none; font-weight: 500; }
    @media (max-width: 480px) { .ticket-info { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">Heart<span>Echo</span> Support</div>
      <div class="ticket-id">ID: #${ticketIdShort}</div>
    </div>
    <div class="content">
      <div class="greeting">Hi ${user.name || "there"},</div>
      <p style="margin-top: 0;">Your support ticket has been updated by our team. Please review the response below.</p>
      <div class="ticket-info">
        <div class="info-item">Date: <strong>${dateStr}</strong></div>
        <div class="info-item">Status: <span class="status-badge">Replied</span></div>
        <div class="info-item">Account: <strong>${user.email}</strong></div>
        <div class="info-item">Tier: <strong>${tierDisplay}</strong></div>
      </div>
      <div class="thread">
        <div class="message-block msg-user">
          <div class="message-header">Your Report</div>
          <p>"${ticket.issue}"</p>
        </div>
        <div class="message-block msg-admin">
          <div class="message-header">Our Reply</div>
          <p>${adminReply.replace(/\n/g, '<br>')}</p>
        </div>
      </div>
    </div>
    <div class="footer">
      <div class="help-box">
        Still having issues? Email us directly at <br>
        <a href="mailto:heartecho.help@gmail.com?subject=Ticket #${ticketIdShort}">heartecho.help@gmail.com</a>
        <br><span style="font-size: 12px; opacity: 0.8; display: inline-block; margin-top: 4px;">*Please include your Ticket ID <strong>#${ticketIdShort}</strong> in the email.</span>
      </div>
      <p style="margin: 0;">HeartEcho Support Team</p>
    </div>
  </div>
</body>
</html>`;

    // Send via Nodemailer
    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"HeartEcho Support" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Re: Your Support Ticket #${ticketIdShort} — HeartEcho`,
      html: emailHtml
    });

    // Mark ticket as Resolved
    await Complaint.findByIdAndUpdate(id, { status: "Resolved" });

    return res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} and ticket marked as Resolved`
    });
  } catch (error) {
    console.error("Error sending ticket email reply:", error);
    return res.status(500).json({ success: false, message: "Failed to send email reply", error: error.message });
  }
};

// ============================================================
// FETCH FEEDBACK FOR DELETED USER (cross-reference by originalUserId)
// ============================================================
exports.getDeletedUserFeedback = async (req, res) => {
  try {
    const { originalUserId } = req.params;
    // Try to find feedback — originalUserId stored as string, match against user ObjectId
    const Feedback = require("../models/Feedback");
    let feedbackDoc = null;
    if (mongoose.Types.ObjectId.isValid(originalUserId)) {
      feedbackDoc = await Feedback.findOne({ user: new mongoose.Types.ObjectId(originalUserId) })
        .sort({ date: -1 })
        .lean();
    }
    if (feedbackDoc) {
      return res.status(200).json({
        success: true,
        feedback: feedbackDoc.text || "",
        rating: feedbackDoc.rating || 0,
        city: feedbackDoc.city || "",
        feature: feedbackDoc.feature || ""
      });
    }
    return res.status(200).json({ success: false, feedback: "", rating: 0, city: "", feature: "" });
  } catch (error) {
    return res.status(200).json({ success: false, feedback: "", rating: 0, city: "", feature: "" });
  }
};

// ============================================================
// AI SUGGEST FAREWELL REPLY FOR DELETED ACCOUNT
// ============================================================
exports.getAiDeletedAccountReply = async (req, res) => {
  try {
    const { feedback, rating, userName } = req.body;

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) {
      return res.status(500).json({ success: false, message: "OpenRouter API key not configured" });
    }

    const systemPrompt = `You are a warm, respectful, and empathetic retention specialist for HeartEcho. Your job is to write a final farewell message to Indian users who have just deleted their accounts and left feedback/ratings.

Your tone must be polite, non-defensive, understanding, and very brief. You want to leave a positive final impression so they might return in the future.

=== CONTEXT ===
- The user has already deleted their account. Their data is gone. We cannot fix their account.
- You are replying to the specific reason they gave for leaving.

=== HOW TO RESPOND BASED ON FEEDBACK ===

1. EXPENSIVE / PRICING ISSUES (e.g., "too much expensive", "high cost", "costly"):
Validate their feedback. Tell them we are actively working on introducing more affordable "bite-sized" or sachet plans for our Indian users soon.

2. AI QUALITY / BORING / REPETITIVE (e.g., "ai is dumb", "boring replies", "not natural"):
Apologize that the connection didn't feel natural. Mention that our engineering team is constantly upgrading the AI models to be smarter and more human-like.

3. APP BUGS / CRASHES / GLITCHES (e.g., "app crashes", "not working", "buggy"):
Apologize for the technical frustration. Let them know our developers are actively fixing these bugs to make the app smoother.

4. PRIVACY / FAKE CONCERNS (e.g., "privacy", "fake", "not safe"):
Reassure them that HeartEcho values privacy deeply, and confirm that all their chats and data have been permanently erased from our servers as requested.

5. NO REASON / JUST A STAR RATING / VAGUE:
Simply thank them for giving HeartEcho a try and wish them the best.

=== STRICT REPLY RULES ===
- Start directly (DO NOT say "Hi [Name]" — the email template already has the greeting).
- Keep it VERY SHORT (Target: 30 to 60 words max).
- Acknowledge their specific issue respectfully. Do not argue with them.
- Always leave the door open (e.g., "We hope to welcome you back in the future.").
- Do NOT offer refunds, do NOT ask them to email support (their account is already deleted).
- NEVER use placeholders like [X], <name>, [insert here].
- End EVERY reply exactly with: — HeartEcho Team 💜`;

    const userPrompt = `User: ${userName || "User"}
Rating: ${rating ? `${rating}/5 stars` : "No rating given"}
Feedback: "${feedback || "No feedback provided"}"

Write the farewell reply now:`;

    const freeModels = [
      "qwen/qwen3-coder:free",
      "google/gemma-4-31b-it:free",
      "openrouter/free",
      "meta-llama/llama-3.3-70b-instruct:free",
      "meta-llama/llama-3.2-3b-instruct:free"
    ];

    let aiReply = null;
    for (const model of freeModels) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://www.heartecho.in",
            "X-Title": "HeartEcho Admin"
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            max_tokens: 150,
            temperature: 0.65,
          })
        });
        if (!response.ok) continue;
        const data = await response.json();
        if (data.choices?.[0]?.message?.content) {
          aiReply = data.choices[0].message.content.trim();
          break;
        }
      } catch (e) { continue; }
    }

    if (!aiReply) {
      aiReply = `We're sorry to see you go. Thank you for giving HeartEcho a chance and for sharing your honest feedback. We will use it to improve. We hope to welcome you back someday. — HeartEcho Team 💜`;
    }

    return res.status(200).json({ success: true, reply: aiReply });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to generate AI reply", error: error.message });
  }
};

// ============================================================
// SEND FAREWELL EMAIL TO DELETED ACCOUNT USER
// ============================================================
exports.sendDeletedAccountEmail = async (req, res) => {
  try {
    const { email, name, feedback, rating, city, deletedAt, aiReply } = req.body;

    if (!email) return res.status(400).json({ success: false, message: "Email is required" });
    if (!aiReply?.trim()) return res.status(400).json({ success: false, message: "Reply text is required" });

    const dateStr = new Date(deletedAt || Date.now()).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    const stars = rating ? "⭐".repeat(Math.min(rating, 5)) : "—";

    const emailHtml = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Deleted - HeartEcho</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
    html, body { margin: 0; padding: 0; height: 100%; width: 100%; -webkit-text-size-adjust: 100%; background-color: #120524; }
    * { box-sizing: border-box; }
    body { font-family: 'DM Sans', -apple-system, sans-serif; color: #e2d8f0; padding: 20px 10px; font-size: 14px; line-height: 1.6; }
    .container { max-width: 540px; margin: 0 auto; background-color: #0f0620; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden; }
    .header { background-color: #160a2b; padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; }
    .brand { font-weight: 600; font-size: 16px; color: #fff; }
    .brand span { color: #ff4099; }
    .header-badge { font-size: 11px; background: rgba(255,255,255,0.1); color: #a395b5; padding: 4px 8px; border-radius: 4px; font-weight: 600; text-transform: uppercase; }
    .content { padding: 24px; }
    .greeting { font-size: 16px; font-weight: 500; color: #fff; margin-bottom: 12px; }
    .ticket-info { background: rgba(255,255,255,0.02); border-radius: 8px; padding: 16px; margin-bottom: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px; }
    .info-item { color: #a395b5; }
    .info-item strong { color: #fff; font-weight: 500; }
    .rating { color: #ffb74d; font-size: 14px; letter-spacing: 2px; }
    .thread { margin-bottom: 24px; }
    .message-block { margin-bottom: 16px; padding: 16px; border-radius: 8px; }
    .message-header { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
    .msg-user { background: rgba(255,255,255,0.03); border-left: 3px solid #5a4b70; }
    .msg-user .message-header { color: #a395b5; }
    .msg-user p { margin: 0; color: #cfc2df; font-style: italic; }
    .msg-admin { background: linear-gradient(180deg, rgba(233,30,140,0.05) 0%, rgba(233,30,140,0.01) 100%); border-left: 3px solid #e91e8c; }
    .msg-admin .message-header { color: #ff6b9d; }
    .msg-admin p { margin: 0; color: #fff; white-space: pre-wrap; }
    .footer { background-color: #160a2b; padding: 24px; border-top: 1px solid rgba(255,255,255,0.05); font-size: 13px; color: #a395b5; text-align: center; }
    .footer strong { color: #fff; }
    @media (max-width: 480px) { .ticket-info { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">Heart<span>Echo</span></div>
      <div class="header-badge">Account Deleted</div>
    </div>
    <div class="content">
      <div class="greeting">Hi ${name || "there"},</div>
      <p style="margin-top: 0;">We're confirming that your HeartEcho account has been successfully deleted, and your data has been securely removed from our servers. Thank you for trying our app.</p>
      <div class="ticket-info">
        <div class="info-item">Date: <strong>${dateStr}</strong></div>
        <div class="info-item">Your Rating: <span class="rating">${stars || "—"}</span></div>
        <div class="info-item">Status: <strong>Data Erased ✓</strong></div>
      </div>
      <div class="thread">
        <div class="message-block msg-user">
          <div class="message-header">Your Feedback</div>
          <p>"${(feedback || "No feedback provided").replace(/</g,"&lt;").replace(/>/g,"&gt;")}"</p>
        </div>
        <div class="message-block msg-admin">
          <div class="message-header">A Note From Our Team</div>
          <p>${aiReply.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</p>
        </div>
      </div>
    </div>
    <div class="footer">
      <p style="margin: 0 0 8px 0;">If you ever decide to return, your companion will be ready to start a fresh journey with you.</p>
      <p style="margin: 0;"><strong>HeartEcho Team</strong> 💜</p>
    </div>
  </div>
</body>
</html>`;

    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", port: 465, secure: true,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    await transporter.sendMail({
      from: `"HeartEcho Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Your HeartEcho Account Has Been Deleted — A Note From Us 💜`,
      html: emailHtml
    });

    return res.status(200).json({ success: true, message: `Farewell email sent to ${email}` });
  } catch (error) {
    console.error("Error sending deleted account email:", error);
    return res.status(500).json({ success: false, message: "Failed to send email", error: error.message });
  }
};

exports.sendCustomNotification = async (req, res) => {
  try {
    const { target, userIds, title, body, data = {}, imageUrl } = req.body;
    
    // Create a log entry first to get an ID for tracking
    const logEntry = new NotificationLog({
      title,
      body,
      imageUrl,
      target
    });
    await logEntry.save();

    // Prepare common data payload with tracking ID
    const enrichedData = {
      ...data,
      notificationId: logEntry._id.toString(),
      click_action: "FLUTTER_NOTIFICATION_CLICK" // Common for Flutter
    };

    let users = [];
    if (target === 'all') {
      users = await User.find({ fcmToken: { $ne: "" } }).select("fcmToken name");
    } else {
      users = await User.find({ _id: { $in: userIds }, fcmToken: { $ne: "" } }).select("fcmToken name");
    }

    if (users.length === 0) {
      return res.status(400).json({ success: false, message: "No users with FCM tokens found" });
    }

    const hasPersonalization = title.includes("{name}") || body.includes("{name}");

    if (hasPersonalization) {
      // Send personalized messages
      const messages = users.map(user => {
        const personalizedTitle = title.replace(/{name}/g, user.name || "User");
        const personalizedBody = body.replace(/{name}/g, user.name || "User");
        
        return {
          token: user.fcmToken,
          notification: {
            title: personalizedTitle,
            body: personalizedBody,
            ...(imageUrl && { image: imageUrl })
          },
          data: enrichedData
        };
      });

      // Firebase sendEach limit is 500
      for (let i = 0; i < messages.length; i += 500) {
        const batch = messages.slice(i, i + 500);
        await sendEachPersonalizedNotification(batch);
      }
    } else {
      // Send multicast (standard)
      const tokens = users.map(u => u.fcmToken);
      for (let i = 0; i < tokens.length; i += 500) {
        const batch = tokens.slice(i, i + 500);
        await sendMulticastNotification(batch, title, body, enrichedData, imageUrl);
      }
    }

    // Update log with recipient count
    logEntry.recipientsCount = users.length;
    await logEntry.save();

    return res.json({ 
      success: true, 
      message: `Notification sent to ${users.length} users`,
      notificationId: logEntry._id
    });
  } catch (error) {
    console.error("Error sending admin notification:", error);
    res.status(500).json({ success: false, message: "Error sending notification", error: error.message });
  }
};

exports.trackNotificationClick = async (req, res) => {
  try {
    const { notificationId } = req.body;
    const userId = req.user.id; // From authMiddleware

    if (!notificationId) {
      return res.status(400).json({ success: false, message: "Notification ID is required" });
    }

    const log = await NotificationLog.findById(notificationId);
    if (!log) {
      return res.status(404).json({ success: false, message: "Notification log not found" });
    }

    // Check if user already clicked (unique opens)
    const alreadyClicked = log.uniqueOpens.some(id => id.toString() === userId.toString());
    
    await NotificationLog.findByIdAndUpdate(notificationId, {
      $inc: { opensCount: 1 },
      $push: { 
        clicks: { 
          user: userId, 
          clickedAt: new Date(),
          platform: req.headers['user-agent'] 
        },
        ...(!alreadyClicked && { uniqueOpens: userId })
      }
    });

    res.json({ success: true, message: "Click tracked successfully" });
  } catch (error) {
    console.error("Error tracking notification click:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete a ticket
exports.deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Ticket ID",
      });
    }

    const deletedTicket = await Complaint.findByIdAndDelete(id);

    if (!deletedTicket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Ticket deleted successfully",
      data: deletedTicket,
    });
  } catch (error) {
    console.error("Error deleting ticket:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Update a ticket (for editing and toggling status)
exports.updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Ticket ID",
      });
    }

    // Validate required fields
    const requiredFields = ["user", "issue"];
    for (const field of requiredFields) {
      if (!(field in updatedData) || !updatedData[field]) {
        return res.status(400).json({
          success: false,
          message: `Missing or invalid required field: ${field}`,
        });
      }
    }

    // Validate status if provided
    if (updatedData.status && !["Pending", "Resolved"].includes(updatedData.status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'Pending' or 'Resolved'",
      });
    }

    const updatedTicket = await Complaint.findByIdAndUpdate(
      id,
      updatedData,
      { new: true, runValidators: true }
    ).populate("user", "name email phone_number gender age user_type subscriptionTier joinedAt");

    if (!updatedTicket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Ticket updated successfully",
      data: updatedTicket,
    });
  } catch (error) {
    console.error("Error updating ticket:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};




exports.creatorLogin = async (req, res) => {
  try {
    const { referralId, password } = req.body;

    if (!referralId || !password) {
      return res.status(400).json({
        success: false,
        message: "Referral ID and password are required"
      });
    }

    // Find creator by referral ID
    const creator = await ReferralCreator.findOne({ 
      referralId,
      isActive: true 
    });

    if (!creator) {
      return res.status(404).json({
        success: false,
        message: "Creator not found or inactive"
      });
    }

    // Verify password
    const isMatch = await creator.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password"
      });
    }

    // Generate token
    const token = generateCreatorToken(creator);

    res.status(200).json({
      success: true,
      token,
      creator: {
        id: creator._id,
        name: creator.name,
        referralId: creator.referralId,
        stats: creator.stats
      }
    });
  } catch (error) {
    console.error("Creator login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

exports.getSignupConversionStats = async (req, res) => {
  try {
    const { type } = req.query; // 'daily' or 'monthly'

    if (type === 'daily') {
      // Last 7 days
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const d = moment().subtract(i, "days").startOf("day");
        last7Days.push(d.format("YYYY-MM-DD"));
      }

      const start = moment().subtract(6, "days").startOf("day").toDate();
      const end = moment().endOf("day").toDate();

      const signupStats = await User.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        }
      ]);

      const conversionStats = await Payment.aggregate([
        { $match: { date: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            count: { $addToSet: "$user" } // Unique users
          }
        },
        {
          $project: {
            _id: 1,
            count: { $size: "$count" }
          }
        }
      ]);

      const data = last7Days.map(date => {
        const signup = signupStats.find(s => s._id === date);
        const conversion = conversionStats.find(c => c._id === date);
        return {
          date: moment(date).format("MMM DD"),
          signups: signup ? signup.count : 0,
          conversions: conversion ? conversion.count : 0
        };
      });

      return res.status(200).json({ success: true, data });

    } else {
      // Monthly for last 12 months
      const last12Months = [];
      for (let i = 11; i >= 0; i--) {
        const d = moment().subtract(i, "months").startOf("month");
        last12Months.push(d.format("YYYY-MM"));
      }

      const start = moment().subtract(11, "months").startOf("month").toDate();
      const end = moment().endOf("month").toDate();

      const signupStats = await User.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        }
      ]);

      const conversionStats = await Payment.aggregate([
        { $match: { date: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
            count: { $addToSet: "$user" } // Unique users
          }
        },
        {
          $project: {
            _id: 1,
            count: { $size: "$count" }
          }
        }
      ]);

      const data = last12Months.map(month => {
        const signup = signupStats.find(s => s._id === month);
        const conversion = conversionStats.find(c => c._id === month);
        return {
          date: moment(month, "YYYY-MM").format("MMM YYYY"),
          signups: signup ? signup.count : 0,
          conversions: conversion ? conversion.count : 0
        };
      });

      return res.status(200).json({ success: true, data });
    }

  } catch (error) {
    console.error("Error fetching signup vs conversion stats:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};



// Get all referral creators
exports.getReferralCreators = async (req, res) => {
  try {
    const creators = await ReferralCreator.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      creators
    });
  } catch (error) {
    console.error("Error fetching referral creators:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Update create referral creator to include password
exports.createReferralCreator = async (req, res) => {
  try {
    const {
      name,
      platform,
      username,
      password,
      commissionRate,
      email,
      phone,
      notes
    } = req.body;

    // Validate required fields
    if (!name || !platform || !username || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, platform, username, and password are required fields"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long"
      });
    }

    // Check if creator with same platform and username already exists
    const existingCreator = await ReferralCreator.findOne({
      platform,
      username
    });

    if (existingCreator) {
      return res.status(400).json({
        success: false,
        message: "Creator with this platform and username already exists"
      });
    }

    const creator = new ReferralCreator({
      name,
      platform,
      username,
      password,
      commissionRate: commissionRate || 15,
      email,
      phone,
      notes,
      isActive: true
    });

    await creator.save();

    res.status(201).json({
      success: true,
      message: "Referral creator created successfully",
      creator: {
        id: creator._id,
        name: creator.name,
        referralId: creator.referralId,
        platform: creator.platform,
        username: creator.username
      }
    });
  } catch (error) {
    console.error("Error creating referral creator:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};



// Get creator dashboard (protected)
exports.getCreatorDashboard = async (req, res) => {
  try {
    const creator = req.creator;

    // Get all users who signed up using this referral
    const referredUsers = await User.find({ 
      referredBy: creator._id 
    })
    .select('name email user_type subscriptionExpiry joinedAt payment_history')
    .populate({
      path: 'payment_history',
      select: 'rupees transaction_id date expiry_date'
    })
    .sort({ createdAt: -1 });

    // Calculate detailed statistics (your existing code)
    const totalReferredUsers = referredUsers.length;
    const activeSubscribers = referredUsers.filter(user => 
      user.user_type === 'subscriber' && 
      (user.subscriptionExpiry === null || new Date(user.subscriptionExpiry) > new Date())
    ).length;

    // Calculate earnings (your existing code)
    let totalSubscriptionRevenue = 0;
    let subscriptionDetails = [];

    referredUsers.forEach(user => {
      if (user.payment_history && user.payment_history.length > 0) {
        user.payment_history.forEach(payment => {
          if (payment.rupees) {
            const mappedAmount = mapReferralAmount(payment.rupees);
            
            // If mapped amount is 0, we treat it as if they didn't purchase (per user request)
            if (mappedAmount > 0) {
              totalSubscriptionRevenue += mappedAmount;
              subscriptionDetails.push({
                userName: user.name,
                userEmail: user.email,
                planType: determinePlanType(payment.rupees), // Still show actual plan type or mapped? Mapping usually hides actual tier.
                actualPlanType: determinePlanType(payment.rupees),
                amount: formatToTwoDecimals(mappedAmount),
                purchaseDate: payment.date,
                transactionId: payment.transaction_id,
                expiryDate: payment.expiry_date,
                status: payment.expiry_date && new Date(payment.expiry_date) > new Date() ? 'active' : 'expired'
              });
            }
          }
        });
      }
    });

    const signupEarnings = formatToTwoDecimals(totalReferredUsers * 20);
    const subscriptionEarnings = formatToTwoDecimals(totalSubscriptionRevenue * (creator.commissionRate / 100));
    const totalCalculatedEarnings = formatToTwoDecimals(signupEarnings + subscriptionEarnings);

    // Update creator's earnings if calculated earnings are different
    if (totalCalculatedEarnings > creator.totalEarnings) {
      const earningsDifference = totalCalculatedEarnings - creator.totalEarnings;
      
      await ReferralCreator.findByIdAndUpdate(creator._id, {
        $inc: {
          totalEarnings: earningsDifference,
          pendingEarnings: earningsDifference,
          referralCount: totalReferredUsers - creator.referralCount
        }
      });
    }

    // Get updated creator data
    const updatedCreator = await ReferralCreator.findById(creator._id);

    const formattedCreator = {
      ...updatedCreator.toObject(),
      totalEarnings: formatToTwoDecimals(updatedCreator.totalEarnings),
      pendingEarnings: formatToTwoDecimals(updatedCreator.pendingEarnings),
      withdrawnAmount: formatToTwoDecimals(updatedCreator.withdrawnAmount || 0)
    };

    // Prepare response data (your existing code)
    const dashboardData = {
      creator: formattedCreator,
      analytics: {
        totalReferredUsers,
        activeSubscribers,
        conversionRate: totalReferredUsers > 0 ? 
          Math.round((activeSubscribers / totalReferredUsers) * 100) : 0,
        totalSubscriptionRevenue: formatToTwoDecimals(totalSubscriptionRevenue),
        signupEarnings: formatToTwoDecimals(signupEarnings),
        subscriptionEarnings: formatToTwoDecimals(subscriptionEarnings),
        totalCalculatedEarnings: formatToTwoDecimals(totalCalculatedEarnings)
      },
      referredUsers: referredUsers.slice(0, 10).map(user => ({
        name: user.name || 'Unknown User',
        email: user.email,
        date: user.joinedAt,
        type: user.user_type === 'subscriber' ? 'subscriber' : 'free_user',
        status: user.user_type === 'subscriber' && 
                (user.subscriptionExpiry === null || new Date(user.subscriptionExpiry) > new Date()) 
                ? 'active' : 'inactive'
      })),
      subscriptionDetails: subscriptionDetails.slice(0, 10)
    };

    res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error("Error fetching creator dashboard:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Update referral creator
exports.updateReferralCreator = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Referral Creator ID",
      });
    }

    // Check if updating to duplicate platform+username
    if (updateData.platform && updateData.username) {
      const existingCreator = await ReferralCreator.findOne({
        platform: updateData.platform,
        username: updateData.username,
        _id: { $ne: id }
      });

      if (existingCreator) {
        return res.status(400).json({
          success: false,
          message: "Another creator with this platform and username already exists"
        });
      }
    }

    // If updating password, handle hashing and plainPassword separately
    if (updateData.password) {
      updateData.plainPassword = updateData.password;
      const bcrypt = require('bcryptjs');
      updateData.password = await bcrypt.hash(updateData.password, 12);
    }
    
    const updatedCreator = await ReferralCreator.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedCreator) {
      return res.status(404).json({
        success: false,
        message: "Referral creator not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Referral creator updated successfully",
      creator: updatedCreator
    });
  } catch (error) {
    console.error("Error updating referral creator:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Delete referral creator
exports.deleteReferralCreator = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Referral Creator ID",
      });
    }

    const deletedCreator = await ReferralCreator.findByIdAndDelete(id);

    if (!deletedCreator) {
      return res.status(404).json({
        success: false,
        message: "Referral creator not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Referral creator deleted successfully",
      data: deletedCreator,
    });
  } catch (error) {
    console.error("Error deleting referral creator:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get referral creator by referral ID
// Get referral creator by referral ID with detailed user and subscription data
// Get referral creator by referral ID with detailed user and subscription data
// Get referral creator by referral ID with detailed user and subscription data
exports.getCreatorByReferralId = async (req, res) => {
  try {
    const { referralId } = req.params;

    const creator = await ReferralCreator.findOne({referralId});

    if (!creator) {
      return res.status(404).json({
        success: false,
        message: "Referral creator not found or inactive",
      });
    }

    // Get all users who signed up using this referral
    const referredUsers = await User.find({ 
      referredBy: creator._id 
    })
    .select('name email user_type subscriptionExpiry joinedAt payment_history')
    .populate({
      path: 'payment_history',
      select: 'rupees transaction_id date expiry_date'
    })
    .sort({ createdAt: -1 });

    // Calculate detailed statistics
    const totalReferredUsers = referredUsers.length;
    
    // Count active subscribers
    const activeSubscribers = referredUsers.filter(user => 
      user.user_type === 'subscriber' && 
      (user.subscriptionExpiry === null || new Date(user.subscriptionExpiry) > new Date())
    ).length;

    // Calculate total subscription revenue from referred users
    let totalSubscriptionRevenue = 0;
    let subscriptionDetails = [];

    referredUsers.forEach(user => {
      if (user.payment_history && user.payment_history.length > 0) {
        user.payment_history.forEach(payment => {
          if (payment.rupees) {
            const mappedAmount = mapReferralAmount(payment.rupees);
            
            if (mappedAmount > 0) {
              totalSubscriptionRevenue += mappedAmount;
              subscriptionDetails.push({
                userName: user.name,
                userEmail: user.email,
                planType: determinePlanType(payment.rupees),
                amount: formatToTwoDecimals(mappedAmount),
                purchaseDate: payment.date,
                transactionId: payment.transaction_id,
                expiryDate: payment.expiry_date,
                status: payment.expiry_date && new Date(payment.expiry_date) > new Date() ? 'active' : 'expired'
              });
            }
          }
        });
      }
    });

    // Calculate earnings breakdown and format to 2 decimal places
    const signupEarnings = formatToTwoDecimals(totalReferredUsers * 20); // ₹20 per signup
    const subscriptionEarnings = formatToTwoDecimals(totalSubscriptionRevenue * (creator.commissionRate / 100)); // Commission on subscriptions
    const totalCalculatedEarnings = formatToTwoDecimals(signupEarnings + subscriptionEarnings);

    // UPDATE CREATOR'S EARNINGS IF CALCULATED EARNINGS ARE DIFFERENT
    if (totalCalculatedEarnings > creator.totalEarnings) {
      const earningsDifference = totalCalculatedEarnings - creator.totalEarnings;
      
      await ReferralCreator.findByIdAndUpdate(creator._id, {
        $inc: {
          totalEarnings: earningsDifference,
          pendingEarnings: earningsDifference,
          referralCount: totalReferredUsers - creator.referralCount
        }
      });
    }

    // Get updated creator data
    const updatedCreator = await ReferralCreator.findById(creator._id);

    // Format creator earnings to 2 decimal places
    const formattedCreator = {
      ...updatedCreator.toObject(),
      totalEarnings: formatToTwoDecimals(updatedCreator.totalEarnings),
      pendingEarnings: formatToTwoDecimals(updatedCreator.pendingEarnings),
      withdrawnAmount: formatToTwoDecimals(updatedCreator.withdrawnAmount || 0)
    };

    // Get recent referral activity
    const recentReferrals = referredUsers.slice(0, 10).map(user => ({
      name: user.name || 'Unknown User',
      email: user.email,
      date: user.joinedAt,
      type: user.user_type === 'subscriber' ? 'subscriber' : 'free_user',
      status: user.user_type === 'subscriber' && 
              (user.subscriptionExpiry === null || new Date(user.subscriptionExpiry) > new Date()) 
              ? 'active' : 'inactive'
    }));

    // Generate earnings history (last 6 months) with formatted amounts
    const earningsHistory = await generateEarningsHistory(creator._id);

    // Prepare comprehensive response with all amounts formatted
    const detailedCreatorData = {
      ...formattedCreator,
      analytics: {
        totalReferredUsers,
        activeSubscribers,
        conversionRate: totalReferredUsers > 0 ? 
          Math.round((activeSubscribers / totalReferredUsers) * 100) : 0,
        totalSubscriptionRevenue: formatToTwoDecimals(totalSubscriptionRevenue),
        signupEarnings: formatToTwoDecimals(signupEarnings),
        subscriptionEarnings: formatToTwoDecimals(subscriptionEarnings),
        totalCalculatedEarnings: formatToTwoDecimals(totalCalculatedEarnings)
      },
      referredUsers: recentReferrals,
      subscriptionDetails: subscriptionDetails.slice(0, 10),
      earningsHistory: earningsHistory.map(item => ({
        ...item,
        subscriptionRevenue: formatToTwoDecimals(item.subscriptionRevenue),
        totalEarnings: formatToTwoDecimals(item.totalEarnings)
      }))
    };

    // Format payouts if they exist
    if (detailedCreatorData.payouts && detailedCreatorData.payouts.length > 0) {
      detailedCreatorData.payouts = detailedCreatorData.payouts.map(payout => ({
        ...payout,
        amount: formatToTwoDecimals(payout.amount)
      }));
    }

    res.status(200).json({
      success: true,
      creator: detailedCreatorData
    });
  } catch (error) {
    console.error("Error fetching creator by referral ID:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Helper function to map referral amounts based on business rules
// 99 plan -> 0 (Not counted as purchase)
// 599 plan -> 99 (Recorded as 99 plan)
// 1499 plan -> 599 (Recorded as 599 plan)
function mapReferralAmount(actualAmount) {
  if (actualAmount >= 1499) return 599;
  if (actualAmount >= 599) return 99;
  return 0; // 99 plan or less returns 0 (not counted)
}

// Helper function to format numbers to 2 decimal places
function formatToTwoDecimals(number) {
  if (typeof number !== 'number' || isNaN(number)) {
    return 0.00;
  }
  return parseFloat(number.toFixed(2));
}

// Helper function to determine plan type based on payment amount
function determinePlanType(amount) {
  if (amount >= 1499) return "Ultimate Plan";
  if (amount >= 599) return "Premium Plan";
  if (amount >= 99) return "Basic Plan";
  return "Free Trial";
}

// Helper function to generate earnings history
async function generateEarningsHistory(creatorId) {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  // Get users who signed up in the last 6 months through this referral
  const recentReferredUsers = await User.find({
    referredBy: creatorId,
    joinedAt: { $gte: sixMonthsAgo }
  })
  .select('joinedAt user_type payment_history')
  .populate({
    path: 'payment_history',
    select: 'rupees date'
  });

  // Group by month
  const monthlyEarnings = {};
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`;
    monthlyEarnings[monthKey] = {
      signups: 0,
      subscriptionRevenue: 0,
      totalEarnings: 0
    };
  }

  // Calculate earnings per month
  recentReferredUsers.forEach(user => {
    const joinDate = new Date(user.joinedAt);
    const monthKey = `${months[joinDate.getMonth()]} ${joinDate.getFullYear()}`;
    
    if (monthlyEarnings[monthKey]) {
      monthlyEarnings[monthKey].signups += 1;
      
      // Add subscription revenue if any
      if (user.payment_history && user.payment_history.length > 0) {
        user.payment_history.forEach(payment => {
          const paymentDate = new Date(payment.date);
          const paymentMonthKey = `${months[paymentDate.getMonth()]} ${paymentDate.getFullYear()}`;
          
          if (monthlyEarnings[paymentMonthKey]) {
            const mappedAmount = mapReferralAmount(payment.rupees);
            monthlyEarnings[paymentMonthKey].subscriptionRevenue += mappedAmount;
          }
        });
      }
    }
  });

  // Convert to array format for frontend with formatted amounts
  return Object.keys(monthlyEarnings).map(month => ({
    month,
    signups: monthlyEarnings[month].signups,
    subscriptionRevenue: formatToTwoDecimals(monthlyEarnings[month].subscriptionRevenue),
    totalEarnings: formatToTwoDecimals((monthlyEarnings[month].signups * 20) + (monthlyEarnings[month].subscriptionRevenue * 0.15))
  }));
}

// Get referral statistics
exports.getReferralStats = async (req, res) => {
  try {
    // Get basic stats
    const stats = await ReferralCreator.aggregate([
      {
        $group: {
          _id: null,
          totalCreators: { $sum: 1 },
          activeCreators: { $sum: { $cond: ["$isActive", 1, 0] } },
          totalReferrals: { $sum: "$referralCount" },
          totalEarnings: { $sum: "$totalEarnings" },
          pendingEarnings: { $sum: "$pendingEarnings" }
        }
      }
    ]);

    // Get platform distribution
    const platformStats = await ReferralCreator.aggregate([
      {
        $group: {
          _id: "$platform",
          count: { $sum: 1 },
          totalReferrals: { $sum: "$referralCount" },
          totalEarnings: { $sum: "$totalEarnings" }
        }
      }
    ]);

    // Get top performers
    const topPerformers = await ReferralCreator.find({
      referralCount: { $gt: 0 }
    })
    .sort({ referralCount: -1 })
    .limit(5)
    .select('name platform username referralCount totalEarnings referralId');

    // Get recent referrals (users who signed up with referral)
    const recentReferrals = await User.find({
      referredBy: { $exists: true, $ne: null }
    })
    .populate('referredBy', 'name platform username referralId')
    .sort({ createdAt: -1 })
    .limit(10)
    .select('name email createdAt referredBy');

    const response = {
      summary: stats[0] || {
        totalCreators: 0,
        activeCreators: 0,
        totalReferrals: 0,
        totalEarnings: 0,
        pendingEarnings: 0
      },
      platformStats,
      topPerformers,
      recentReferrals: recentReferrals || []
    };

    res.status(200).json({
      success: true,
      stats: response
    });
  } catch (error) {
    console.error("Error fetching referral stats:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get detailed referral analytics
exports.getReferralAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query; // 7d, 30d, 90d, 1y

    // Calculate date range based on period
    let startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default: // 30d
        startDate.setDate(startDate.getDate() - 30);
    }

    // Get referral trend data
    const referralTrend = await User.aggregate([
      {
        $match: {
          referredBy: { $exists: true, $ne: null },
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get creator performance with detailed activity
    const creatorPerformance = await ReferralCreator.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "referredBy",
          as: "referredUsers"
        }
      },
      {
        $project: {
          name: 1,
          platform: 1,
          username: 1,
          referralId: 1,
          commissionRate: 1,
          referralCount: 1,
          totalEarnings: 1,
          activeSubscribers: {
            $size: {
              $filter: {
                input: "$referredUsers",
                as: "user",
                cond: { 
                  $and: [
                    { $eq: ["$$user.user_type", "subscriber"] },
                    { $or: [
                      { $eq: ["$$user.subscriptionExpiry", null] },
                      { $gt: ["$$user.subscriptionExpiry", new Date()] }
                    ]}
                  ]
                }
              }
            }
          },
          conversionRate: {
            $cond: [
              { $gt: ["$referralCount", 0] },
              { $multiply: [{ $divide: ["$totalEarnings", "$referralCount"] }, 100] },
              0
            ]
          },
          recentReferrals: {
            $size: {
              $filter: {
                input: "$referredUsers",
                as: "user",
                cond: { $gte: ["$$user.createdAt", startDate] }
              }
            }
          }
        }
      },
      { $sort: { referralCount: -1 } }
    ]);

    // Get detailed activity for referred users (last 50)
    const detailedActivity = await User.find({
      referredBy: { $exists: true, $ne: null }
    })
    .populate('referredBy', 'name username')
    .sort({ createdAt: -1 })
    .limit(50)
    .select('name email user_type joinedAt messageQuota messagesUsedToday lastQuotaReset referredBy');

    res.status(200).json({
      success: true,
      analytics: {
        referralTrend: referralTrend || [],
        creatorPerformance: creatorPerformance || [],
        detailedActivity: detailedActivity || [],
        period
      }
    });
  } catch (error) {
    console.error("Error fetching referral analytics:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Track referral signup (to be called when user signs up with referral)
exports.trackReferralSignup = async (req, res) => {
  try {
    const { creatorId, userId, signupAmount = 0 } = req.body;

    if (!creatorId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Creator ID and User ID are required"
      });
    }

    // Find the creator (can now find by referralId or _id)
    let creator;
    if (mongoose.Types.ObjectId.isValid(creatorId)) {
      creator = await ReferralCreator.findById(creatorId);
    } else {
      // Assume it's a referralId
      creator = await ReferralCreator.findOne({ referralId: creatorId });
    }

    if (!creator) {
      return res.status(404).json({
        success: false,
        message: "Referral creator not found"
      });
    }

    if (!creator.isActive) {
      return res.status(400).json({
        success: false,
        message: "Referral creator is not active"
      });
    }

    // Calculate earnings based on commission rate
    const earnings = (signupAmount * creator.commissionRate) / 100;

    // Update creator stats
    const updatedCreator = await ReferralCreator.findByIdAndUpdate(
      creator._id,
      {
        $inc: {
          referralCount: 1,
          totalEarnings: earnings,
          pendingEarnings: earnings
        }
      },
      { new: true }
    );

    // Update user with referral info
    await User.findByIdAndUpdate(userId, {
      referredBy: creator._id,
      referralSignupDate: new Date(),
      hasUsedReferral: true
    });

    res.status(200).json({
      success: true,
      message: "Referral tracked successfully",
      earnings,
      creator: updatedCreator
    });
  } catch (error) {
    console.error("Error tracking referral:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Process payout for a creator
exports.processPayout = async (req, res) => {
  try {
    const { creatorId, amount } = req.body;

    if (!creatorId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Creator ID and amount are required"
      });
    }

    const creator = await ReferralCreator.findById(creatorId);
    if (!creator) {
      return res.status(404).json({
        success: false,
        message: "Referral creator not found"
      });
    }

    if (creator.pendingEarnings < amount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient pending earnings for payout"
      });
    }

    // Update creator earnings
    const updatedCreator = await ReferralCreator.findByIdAndUpdate(
      creatorId,
      {
        $inc: {
          pendingEarnings: -amount
        },
        $push: {
          payouts: {
            amount,
            date: new Date(),
            status: 'processed'
          }
        }
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Payout processed successfully",
      creator: updatedCreator
    });
  } catch (error) {
    console.error("Error processing payout:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};



exports.getAllChatsDataToday = async (req, res) => {
  try {
    // 1. Define the time range for "Today" (Start of today in IST or Local)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // 2. Fetch chats that have been updated today
    const chats = await Chat.find({
      updatedAt: { $gte: startOfToday },
      isActive: true
    })
    .populate("participants")
    .sort({ updatedAt: -1 })
    .lean();

    const userMap = {};

    for (const chat of chats) {
      // Find the human user
      const humanUser = chat.participants; // Based on your schema: participants is a single ObjectId ref "User"
      if (!humanUser || !humanUser.email) continue;

      const userId = humanUser._id.toString();

      // 3. Filter messages to ONLY show what happened today
      const todaysMessages = chat.messages.filter(m => new Date(m.time) >= startOfToday);

      // If no messages were actually sent today, skip this chat
      if (todaysMessages.length === 0) continue;

      // Grouping logic
      if (!userMap[userId]) {
        userMap[userId] = {
          user: {
            id: userId,
            name: humanUser.name,
            email: humanUser.email,
            profile_picture: humanUser.profile_picture,
            user_type: humanUser.user_type
          },
          interactionsToday: []
        };
      }

      // Identify the AI involved (using your aiParticipants field)
      let aiDetails = null;
      if (chat.aiParticipants) {
        aiDetails = await PrebuiltAIFriend.findById(chat.aiParticipants)
          .select("name avatar_img relationship")
          .lean();
      }

      // Format the messages for the response (User input vs AI reply)
      const messageThread = todaysMessages.map(m => ({
        role: m.senderModel === "User" ? "User" : "AI",
        text: m.text,
        mediaType: m.mediaType,
        time: m.time,
        status: m.status
      }));

      userMap[userId].interactionsToday.push({
        chatId: chat._id,
        aiFriend: aiDetails,
        messageCount: messageThread.length,
        messages: messageThread,
        lastActive: chat.updatedAt
      });
    }

    res.status(200).json({
      success: true,
      count: Object.values(userMap).length,
      date: startOfToday.toDateString(),
      data: Object.values(userMap)
    });

  } catch (error) {
    console.error("Error fetching today's chats:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};



/**
 * Controller to analyze user engagement and login logs
 */
exports.getLoginAnalytics = async (req, res) => {
  try {
    const now = new Date();
    
    // Define time ranges
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 1. Calculate Active Users (Unique User IDs in specific time windows)
    const [dau, wau, mau] = await Promise.all([
      // Daily Active Users (Last 24 Hours)
      LoginDetail.distinct("user", { time: { $gte: oneDayAgo } }),
      // Weekly Active Users (Last 7 Days)
      LoginDetail.distinct("user", { time: { $gte: oneWeekAgo } }),
      // Monthly Active Users (Last 30 Days)
      LoginDetail.distinct("user", { time: { $gte: oneMonthAgo } })
    ]);

    // 2. User & Subscriber Statistics
    const [totalUsers, totalSubscribers, freeUsers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ user_type: "subscriber" }),
      User.countDocuments({ user_type: "free" })
    ]);

    // 3. Detailed Login Logs List (Paginated or limited to latest)
    // You can adjust .limit() based on your needs
    const loginLogs = await LoginDetail.find()
      .populate("user", "name email user_type profile_picture")
      .sort({ time: -1 })
      .limit(100) 
      .lean();

    // 4. Platform Analysis (Optional bonus: see where users log in from)
    const platformStats = await LoginDetail.aggregate([
      { $match: { time: { $gte: oneMonthAgo } } },
      { $group: { _id: "$platform", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      summary: {
        activeMetrics: {
          dau: dau.length,
          wau: wau.length,
          mau: mau.length,
          stickinessRatio: mau.length > 0 ? ((dau.length / mau.length) * 100).toFixed(2) + "%" : "0%"
        },
        userSegments: {
          total: totalUsers,
          subscribers: totalSubscribers,
          free: freeUsers,
          conversionRate: totalUsers > 0 ? ((totalSubscribers / totalUsers) * 100).toFixed(2) + "%" : "0%"
        },
        platforms: platformStats
      },
      logs: loginLogs
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};


exports.getPaymentAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // 1. Calculate Revenue Metrics
    const stats = await Payment.aggregate([
      {
        $facet: {
          totalRevenue: [
            { $group: { _id: "$currency", total: { $sum: "$rupees" } } }
          ],
          thisMonthRevenue: [
            { $match: { date: { $gte: startOfMonth } } },
            { $group: { _id: "$currency", total: { $sum: "$rupees" }, count: { $sum: 1 } } }
          ],
          prevMonthRevenue: [
            { $match: { date: { $gte: startOfPrevMonth, $lte: endOfPrevMonth } } },
            { $group: { _id: "$currency", total: { $sum: "$rupees" } } }
          ],
          paymentDistribution: [
             { $group: { _id: { amount: "$rupees", currency: "$currency" }, count: { $sum: 1 } } },
             { $sort: { "_id.amount": 1 } }
          ]
        }
      }
    ]);

    const revenueSummary = (arr) => arr.reduce((acc, curr) => {
      const curType = curr._id || "INR";
      acc[curType] = curr.total;
      acc.totalInINR = (acc.totalInINR || 0) + (curType === "USD" ? curr.total * 83 : curr.total);
      acc.count = (acc.count || 0) + (curr.count || 0);
      return acc;
    }, { INR: 0, USD: 0, totalInINR: 0, count: 0 });

    const totalRevStats = revenueSummary(stats[0].totalRevenue);
    const thisMonthRevStats = revenueSummary(stats[0].thisMonthRevenue);
    const prevMonthRevStats = revenueSummary(stats[0].prevMonthRevenue);

    const totalRev = totalRevStats.totalInINR;
    const currentMonthRev = thisMonthRevStats.totalInINR;
    const prevMonthRev = prevMonthRevStats.totalInINR;
    const salesCount = thisMonthRevStats.count;

    // 2. Calculate Growth Percentage
    let growthRate = 0;
    if (prevMonthRev > 0) {
      growthRate = ((currentMonthRev - prevMonthRev) / prevMonthRev) * 100;
    }

    // 3. Subscription Status (from User Model)
    const activeSubscribers = await User.countDocuments({ 
      user_type: "subscriber",
      subscriptionExpiry: { $gte: now } 
    });

    // 4. Detailed Payment Logs (Latest 100)
    const paymentLogs = await Payment.find()
      .populate("user", "name email user_type")
      .sort({ date: -1 })
      .limit(100)
      .lean();

    // 5. Check which users came from Facebook Ads
    const userIds = paymentLogs.map(p => p.user?._id).filter(Boolean);
    const trackingDocs = await TrackingEvent.find({
      user: { $in: userIds },
      $or: [
        { "eventData.fbclid": { $ne: null, $exists: true } },
        { "eventData.utm_source": { $regex: /facebook|fb|ig|instagram/i } }
      ]
    }).select("user").lean();

    const fbUserSet = new Set(trackingDocs.map(t => String(t.user)));

    const enrichedLogs = paymentLogs.map(p => {
      const isFb = p.user && fbUserSet.has(String(p.user._id));
      return {
        ...p,
        isFacebookSource: isFb
      };
    });

    res.status(200).json({
      success: true,
      summary: {
        revenue: {
          allTime: totalRev,
          mrr: currentMonthRev, // Monthly Recurring Revenue (current month)
          prevMonth: prevMonthRev,
          growth: `${growthRate.toFixed(2)}%`,
          averageOrderValue: salesCount > 0 ? (currentMonthRev / salesCount).toFixed(2) : 0
        },
        subscriptions: {
          activeSubscribers: activeSubscribers,
          // Estimated churn could be added here if you track cancels
        },
        pricingTiers: stats[0].paymentDistribution // Shows which plan price is most popular
      },
      transactions: enrichedLogs
    });
  } catch (error) {
    console.error("Payment Analytics Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getNotificationHistory = async (req, res) => {
  try {
    const history = await NotificationLog.find()
      .sort({ sentAt: -1 })
      .limit(20)
      .lean();
    
    res.json({ success: true, data: history });
  } catch (error) {
    console.error("Error fetching notification history:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getDeviceStats = async (req, res) => {
  try {
    const [mobileUsers, totalUsers] = await Promise.all([
      User.countDocuments({ isMobileUser: true }),
      User.countDocuments()
    ]);
    const webUsers = totalUsers - mobileUsers;
    res.json({ success: true, data: { mobileUsers, webUsers, totalUsers } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get app version info for admin panel
exports.getAppVersionAdmin = async (req, res) => {
  try {
    const AppVersion = require("../models/AppVersion");
    let versionInfo = await AppVersion.findOne();
    if (!versionInfo) {
      versionInfo = await AppVersion.create({
        latestVersion: "1.0.3",
        latestBuildNumber: 6,
        playStoreUrl: "https://play.google.com/store/apps/details?id=com.heartecho.ai"
      });
    }
    return res.status(200).json({
      success: true,
      versionInfo
    });
  } catch (error) {
    console.error("Error fetching app version for admin:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// Update app version info
exports.updateAppVersionAdmin = async (req, res) => {
  try {
    const { latestVersion, latestBuildNumber, playStoreUrl } = req.body;

    if (!latestVersion || !latestBuildNumber || !playStoreUrl) {
      return res.status(400).json({
        success: false,
        message: "All fields (latestVersion, latestBuildNumber, playStoreUrl) are required"
      });
    }

    const AppVersion = require("../models/AppVersion");
    let versionInfo = await AppVersion.findOne();
    if (!versionInfo) {
      versionInfo = new AppVersion();
    }

    versionInfo.latestVersion = latestVersion;
    versionInfo.latestBuildNumber = Number(latestBuildNumber);
    versionInfo.playStoreUrl = playStoreUrl;
    await versionInfo.save();

    return res.status(200).json({
      success: true,
      message: "App version configuration updated successfully",
      versionInfo
    });
  } catch (error) {
    console.error("Error updating app version:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

exports.getAllFeedbacksAdmin = async (req, res) => {
  try {
    const { live, rating, isConcern, search } = req.query;
    const filter = {};

    if (live !== undefined && live !== '') {
      filter.live = live === 'true';
    }
    if (isConcern !== undefined && isConcern !== '') {
      filter.isConcern = isConcern === 'true';
    }
    if (rating !== undefined && rating !== '') {
      filter.rating = Number(rating);
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { text: { $regex: search, $options: 'i' } }
      ];
    }

    const feedbacks = await Feedback.find(filter)
      .sort({ date: -1 })
      .populate("user", "name email");

    return res.status(200).json({
      success: true,
      data: feedbacks
    });
  } catch (error) {
    console.error("Error fetching all feedbacks for admin:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

exports.toggleFeedbackLiveAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({ success: false, message: "Feedback not found" });
    }

    feedback.live = !feedback.live;
    await feedback.save();

    return res.status(200).json({
      success: true,
      message: `Feedback is now ${feedback.live ? 'live' : 'hidden'}`,
      data: feedback
    });
  } catch (error) {
    console.error("Error toggling feedback live status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

exports.deleteFeedbackAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const feedback = await Feedback.findByIdAndDelete(id);
    if (!feedback) {
      return res.status(404).json({ success: false, message: "Feedback not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Feedback deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};