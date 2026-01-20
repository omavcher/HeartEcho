const mongoose = require("mongoose");
const User = require("../models/User");
const AIFriend = require("../models/AIFriend");
const Chat = require("../models/Chat");
const LoginDetail = require("../models/LoginDetail");
const Ticket = require("../models/Ticket");
const Payment = require("../models/Payment");
const moment = require("moment");
require("dotenv").config();
const PrebuiltAIFriend = require("../models/PrebuiltAIFriend");
const ReferralCreator = require("../models/ReferralCreator");
const { generateCreatorToken, verifyReferralCreator } = require('../utils/jwt');


exports.dashboardData = async (req, res) => {
  try {
      const userId = req.user.id;

      // Total users ever registered
      const usersData = await User.countDocuments();

      // Total revenue ever
      const paymentsData = await Payment.aggregate([
          { $group: { _id: null, totalRevenue: { $sum: "$rupees" } } }
      ]);
      const totalRevenue = paymentsData.length > 0 ? paymentsData[0].totalRevenue : 0;

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
                  revenue: { $sum: "$rupees" } 
              } 
          },
          { $sort: { _id: 1 } }
      ]);

      // Latest 10 AI friends created (lifetime)
      const notifications = await AIFriend.find().sort({ createdAt: -1 }).limit(10);

      return res.status(200).json({
          usersData,
          paymentsData: totalRevenue,
          messageQuotaData: totalMessages,
          activeUsers: totalActiveUsers,
          revenueTrend,
          notifications
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
    const userData = await User.find({});

     return res.status(200).json({
        userData
        });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
        return res.status(500).json({ 
            success: false,
            error: "Internal server error" 
        });
  }

}


exports.aiAllModelData = async (req,res) =>{
    try {
      const aiusers = await PrebuiltAIFriend.find({});

       return res.status(200).json({
        aiusers
          });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
          return res.status(500).json({ 
              success: false,
              error: "Internal server error" 
          });
    }
  
  }




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
      // Fetch all tickets
      const tickets = await Complaint.find().lean(); // Use lean() for plain JS objects
  
      // Map through tickets to fetch user names
      const ticketsWithUserNames = await Promise.all(
        tickets.map(async (ticket) => {
          let userName = "Unknown"; // Default if user not found
  
          if (mongoose.Types.ObjectId.isValid(ticket.user)) {
            const user = await User.findById(ticket.user, "name"); // Fetch only the name field
            if (user && user.name) {
              userName = user.name;
            }
          }
  
          // Return ticket with userName instead of full user object
          return {
            _id: ticket._id,
            user: ticket.user, // Keep the user ID
            userName, // Add the fetched user name
            issue: ticket.issue,
            date: ticket.date,
            status: ticket.status,
          };
        })
      );
  
      res.status(200).json({
        success: true,
        data: ticketsWithUserNames,
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
    ).populate("user", "name email");

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
      return res.status(401).json({
        success: false,
        message: "Invalid referral ID or password"
      });
    }

    // Check password
    const isPasswordValid = await creator.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid referral ID or password"
      });
    }

    // Generate token
    const token = generateCreatorToken(creator);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      creator: {
        id: creator._id,
        name: creator.name,
        referralId: creator.referralId,
        platform: creator.platform,
        username: creator.username
      }
    });
  } catch (error) {
    console.error("Error in creator login:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
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
          if (payment.rupees && payment.rupees >= 20) {
            totalSubscriptionRevenue += payment.rupees;
            subscriptionDetails.push({
              userName: user.name,
              userEmail: user.email,
              planType: determinePlanType(payment.rupees),
              amount: formatToTwoDecimals(payment.rupees),
              purchaseDate: payment.date,
              transactionId: payment.transaction_id,
              expiryDate: payment.expiry_date,
              status: payment.expiry_date && new Date(payment.expiry_date) > new Date() ? 'active' : 'expired'
            });
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
          if (payment.rupees && payment.rupees >= 20) {
            totalSubscriptionRevenue += payment.rupees;
            subscriptionDetails.push({
              userName: user.name,
              userEmail: user.email,
              planType: determinePlanType(payment.rupees),
              amount: formatToTwoDecimals(payment.rupees), // Format to 2 decimal places
              purchaseDate: payment.date,
              transactionId: payment.transaction_id,
              expiryDate: payment.expiry_date,
              status: payment.expiry_date && new Date(payment.expiry_date) > new Date() ? 'active' : 'expired'
            });
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

// Helper function to format numbers to 2 decimal places
function formatToTwoDecimals(number) {
  if (typeof number !== 'number' || isNaN(number)) {
    return 0.00;
  }
  return parseFloat(number.toFixed(2));
}

// Helper function to determine plan type based on payment amount
function determinePlanType(amount) {
  if (amount >= 299) return "Yearly Plan";
  if (amount >= 99) return "Monthly Plan";
  if (amount >= 49) return "Quarterly Plan";
  return "Basic Plan";
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
            monthlyEarnings[paymentMonthKey].subscriptionRevenue += payment.rupees || 0;
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

    // Get creator performance
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

    res.status(200).json({
      success: true,
      analytics: {
        referralTrend: referralTrend || [],
        creatorPerformance: creatorPerformance || [],
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



exports.getAllChatsData = async (req, res) => {
  try {
    // Fetch all active chats
    const chats = await Chat.find({ isActive: true })
      .populate("participants")
      .sort({ updatedAt: -1 })
      .lean();

    const userMap = {};

    for (const chat of chats) {
      // Find the actual human user (the one with an email in the participants array)
      const humanUser = chat.participants.find(p => p && p.email);
      if (!humanUser) continue; 

      const userId = humanUser._id.toString();

      // Find the AI ID used in this specific chat from the messages
      const aiMsg = chat.messages.find(m => m.senderModel === "PrebuiltAIFriend");
      const aiId = aiMsg ? aiMsg.sender : null;

      // Grouping logic
      if (!userMap[userId]) {
        userMap[userId] = {
          user: {
            id: userId,
            name: humanUser.name,
            email: humanUser.email,
            profile_picture: humanUser.profile_picture,
            user_type: humanUser.user_type,
            joinedAt: humanUser.joinedAt
          },
          aiInteractions: []
        };
      }

      // Fetch AI details for this specific interaction
      let aiDetails = null;
      if (aiId) {
        aiDetails = await PrebuiltAIFriend.findById(aiId).select("name avatar_img relationship").lean();
      }

      // Filter only user messages for analysis
      const userMessages = chat.messages
        .filter(m => m.senderModel === "User")
        .map(m => ({
          text: m.text,
          time: m.time,
          _id: m._id
        }));

      userMap[userId].aiInteractions.push({
        chatId: chat._id,
        aiFriend: aiDetails,
        messageCount: userMessages.length,
        messages: userMessages,
        lastActive: chat.updatedAt
      });
    }

    res.status(200).json({
      success: true,
      data: Object.values(userMap)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};