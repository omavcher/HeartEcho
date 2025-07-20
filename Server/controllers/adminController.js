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