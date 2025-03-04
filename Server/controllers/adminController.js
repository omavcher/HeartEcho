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
            startDate = moment().subtract(7, 'days').startOf('day');
        } else if (timePeriod === 'month') {
            startDate = moment().subtract(30, 'days').startOf('day');
        } else {
            startDate = moment().subtract(1, 'year').startOf('day');
        }

        const usersData = await User.countDocuments({ joinedAt: { $gte: startDate } });
        
        const paymentsData = await Payment.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            { $group: { _id: null, totalRevenue: { $sum: "$amount" } } }
        ]);
        
        const messageQuotaData = await User.aggregate([
            { $group: { _id: null, totalQuota: { $sum: "$messageQuota" } } }
        ]);
        
        const activeUsers = await LoginDetail.countDocuments({ time: { $gte: startDate } });
        
        const revenueTrend = await Payment.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, revenue: { $sum: "$amount" } } },
            { $sort: { _id: 1 } }
        ]);
        
        const backendNotifications = await AIFriend.find({ createdAt: { $gte: startDate } }).limit(10);
        
        return res.status(200).json({
            usersData,
            paymentsData: paymentsData[0]?.totalRevenue || 0,
            messageQuotaData: messageQuotaData[0]?.totalQuota || 0,
            activeUsers,
            revenueTrend,
            notifications: backendNotifications
        });
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
