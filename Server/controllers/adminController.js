const mongoose = require("mongoose");
const User = require("../models/User");
const AIFriend = require("../models/AIFriend");
const Chat = require("../models/Chat");
const LoginDetail = require("../models/LoginDetail");
const Ticket = require("../models/Ticket");
const Payment = require("../models/Payment");
const moment = require("moment");
require("dotenv").config();



exports.dashboardData = async (req, res) => {
    try {
        const userId = req.user.id;
        const { timePeriod } = req.body;
        
        let startDate;
        if (timePeriod === 'week') {
            startDate = moment().subtract(7, 'days').startOf('day').toDate();
        } else if (timePeriod === 'month') {
            startDate = moment().subtract(30, 'days').startOf('day').toDate();
        } else {
            startDate = moment().subtract(1, 'day').startOf('day').toDate(); // Default to last day's data
        }

        // Fetch user registrations in the given time period
        const usersData = await User.countDocuments({ joinedAt: { $gte: startDate } });
        console.log("Users Registered:", usersData);

        // Fetch total revenue in the given time period
        const paymentsData = await Payment.aggregate([
            { $match: { date: { $gte: startDate } } },
            { $group: { _id: null, totalRevenue: { $sum: "$rupees" } } }
        ]);
        const totalRevenue = paymentsData.length > 0 ? paymentsData[0].totalRevenue : 0;
        console.log("Total Revenue:", totalRevenue);

        // Fetch total number of messages sent by users
        const messageQuotaData = await Chat.aggregate([
            { $unwind: "$messages" },
            { $match: { "messages.senderModel": "User" } },
            { $group: { _id: "$messages.sender", totalMessages: { $sum: 1 } } },
            { $sort: { totalMessages: -1 } }
        ]);
        const totalMessages = messageQuotaData.length > 0 ? messageQuotaData[0].totalMessages : 0;
        console.log("Total Messages Sent:", totalMessages);

        // Fetch unique active users within the time period
        const activeUsersData = await LoginDetail.aggregate([
            { $match: { time: { $gte: startDate } } },
            { $group: { _id: "$user" } },
            { $count: "totalActiveUsers" }
        ]);
        const totalActiveUsers = activeUsersData.length > 0 ? activeUsersData[0].totalActiveUsers : 0;
        console.log("Active Users:", totalActiveUsers);

        // Fetch revenue trend over time
        const revenueTrend = await Payment.aggregate([
            { $match: { date: { $gte: startDate } } },
            { 
                $group: { 
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, 
                    revenue: { $sum: "$rupees" } 
                } 
            },
            { $sort: { _id: 1 } }
        ]);
        console.log("Revenue Trend:", revenueTrend);

        // Fetch latest AI Friends created within the time period
        const notifications = await AIFriend.find({ createdAt: { $gte: startDate } }).limit(10);
        console.log("AI Friends Created:", notifications.length);

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