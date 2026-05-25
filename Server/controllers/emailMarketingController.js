const crypto = require("crypto");
const nodemailer = require("nodemailer");
const SmtpCredential = require("../models/SmtpCredential");
const EmailTemplate = require("../models/EmailTemplate");
const EmailCampaign = require("../models/EmailCampaign");
const EmailQueue = require("../models/EmailQueue");
const EmailTrackingLog = require("../models/EmailTrackingLog");
const User = require("../models/User");
const LoginDetail = require("../models/LoginDetail");

// ==========================================
// PUBLIC TRACKING CONTROLLERS
// ==========================================

// Tracking Open Pixel (transparent 1x1 GIF image)
exports.emailOpen = async (req, res) => {
  const { trackingId } = req.params;
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const userAgent = req.headers["user-agent"];

  try {
    const queueItem = await EmailQueue.findOne({ trackingId });

    if (queueItem) {
      // Check if open tracking log already exists to avoid duplicate count
      const existingLog = await EmailTrackingLog.findOne({ trackingId, action: "open" });
      
      if (!existingLog) {
        // Record log
        await EmailTrackingLog.create({
          trackingId,
          campaign: queueItem.campaign,
          user: queueItem.user,
          email: queueItem.toEmail,
          action: "open",
          ip,
          userAgent
        });

        // Increment campaign openCount
        if (queueItem.campaign) {
          await EmailCampaign.findByIdAndUpdate(queueItem.campaign, {
            $inc: { openCount: 1 }
          });
        }
      }
    }
  } catch (error) {
    console.error("Error logging email open:", error);
  }

  // Return 1x1 Transparent GIF
  const pixel = Buffer.from(
    "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    "base64"
  );
  
  res.writeHead(200, {
    "Content-Type": "image/gif",
    "Content-Length": pixel.length,
    "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0"
  });
  res.end(pixel);
};

// Tracking Click Redirect
exports.emailClick = async (req, res) => {
  const { trackingId } = req.params;
  const { url } = req.query;
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const userAgent = req.headers["user-agent"];

  const redirectUrl = url || "https://heartecho.in/chat";

  try {
    const queueItem = await EmailQueue.findOne({ trackingId });

    if (queueItem) {
      // Check if click tracking log already exists to avoid duplicate count
      const existingLog = await EmailTrackingLog.findOne({ trackingId, action: "click", clickedUrl: redirectUrl });
      
      if (!existingLog) {
        // Record log
        await EmailTrackingLog.create({
          trackingId,
          campaign: queueItem.campaign,
          user: queueItem.user,
          email: queueItem.toEmail,
          action: "click",
          ip,
          userAgent,
          clickedUrl: redirectUrl
        });

        // Increment campaign clickCount
        if (queueItem.campaign) {
          await EmailCampaign.findByIdAndUpdate(queueItem.campaign, {
            $inc: { clickCount: 1 }
          });
        }
      }
    }
  } catch (error) {
    console.error("Error logging email click:", error);
  }

  // Redirect user to original URL
  res.redirect(redirectUrl);
};


// ==========================================
// ADMIN SMTP MANAGEMENT
// ==========================================

exports.getSmtpCredentials = async (req, res) => {
  try {
    const list = await SmtpCredential.find().sort({ createdAt: -1 });
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createSmtpCredential = async (req, res) => {
  try {
    const cred = new SmtpCredential(req.body);
    await cred.save();
    res.status(201).json({ success: true, data: cred });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.updateSmtpCredential = async (req, res) => {
  try {
    const { id } = req.params;
    const cred = await SmtpCredential.findByIdAndUpdate(id, req.body, { new: true });
    if (!cred) return res.status(404).json({ success: false, message: "Credential not found" });
    res.json({ success: true, data: cred });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.deleteSmtpCredential = async (req, res) => {
  try {
    const { id } = req.params;
    const cred = await SmtpCredential.findByIdAndDelete(id);
    if (!cred) return res.status(404).json({ success: false, message: "Credential not found" });
    res.json({ success: true, message: "Credential deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.testSmtpCredential = async (req, res) => {
  const { id } = req.params;
  const { testEmail } = req.body;

  try {
    const cred = await SmtpCredential.findById(id);
    if (!cred) return res.status(404).json({ success: false, message: "Credential not found" });

    const transportConfig = {
      host: cred.host || "smtp.gmail.com",
      port: cred.port || 465,
      secure: cred.secure !== undefined ? cred.secure : true,
      auth: { user: cred.email, pass: cred.pass },
      connectionTimeout: 15000,
      socketTimeout: 15000,
      tls: { rejectUnauthorized: false }
    };

    const transporter = nodemailer.createTransport(transportConfig);

    await transporter.sendMail({
      from: `"HeartEcho SMTP Tester 🛠️" <${cred.email}>`,
      to: testEmail || cred.email,
      subject: "Test Connection - HeartEcho Email system",
      text: "Connection is successful! Your SMTP account has been verified."
    });

    res.json({ success: true, message: "SMTP test email sent successfully!" });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};


// ==========================================
// ADMIN TEMPLATES MANAGEMENT
// ==========================================

exports.getTemplates = async (req, res) => {
  try {
    const list = await EmailTemplate.find().sort({ name: 1 });
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createTemplate = async (req, res) => {
  try {
    const template = new EmailTemplate(req.body);
    await template.save();
    res.status(201).json({ success: true, data: template });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await EmailTemplate.findByIdAndUpdate(id, req.body, { new: true });
    if (!template) return res.status(404).json({ success: false, message: "Template not found" });
    res.json({ success: true, data: template });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await EmailTemplate.findByIdAndDelete(id);
    if (!template) return res.status(404).json({ success: false, message: "Template not found" });
    res.json({ success: true, message: "Template deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// ==========================================
// ADMIN CAMPAIGNS & SENDER
// ==========================================

exports.getCampaigns = async (req, res) => {
  try {
    const list = await EmailCampaign.find()
      .populate("template", "name label")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createCampaign = async (req, res) => {
  const { name, templateId, targetAudience, targetValue, subjectOverride } = req.body;

  try {
    const template = await EmailTemplate.findById(templateId);
    if (!template) return res.status(404).json({ success: false, message: "Template not found" });

    // 1. Build Audience Query
    let query = {};
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const Chat = require("../models/Chat");

    if (targetAudience === "free") {
      query.user_type = "free";
    } else if (targetAudience === "subscribers") {
      query.user_type = "subscriber";
    } else if (targetAudience === "new_users_today") {
      query.createdAt = { $gte: startOfToday };
    } else if (targetAudience === "new_users_7d") {
      query.createdAt = { $gte: sevenDaysAgo };
    } else if (targetAudience === "free_today") {
      query.user_type = "free";
      query.createdAt = { $gte: startOfToday };
    } else if (targetAudience === "free_7d") {
      query.user_type = "free";
      query.createdAt = { $gte: sevenDaysAgo };
    } else if (targetAudience === "subscribers_today") {
      query.user_type = "subscriber";
      query.createdAt = { $gte: startOfToday };
    } else if (targetAudience === "subscribers_7d") {
      query.user_type = "subscriber";
      query.createdAt = { $gte: sevenDaysAgo };
    } else if (targetAudience === "free_no_chat") {
      const chattingUserIds = await Chat.distinct("participants");
      query = { user_type: "free", _id: { $nin: chattingUserIds } };
    } else if (targetAudience === "free_chatted_no_sub") {
      const chattingUserIds = await Chat.distinct("participants");
      query = { user_type: "free", _id: { $in: chattingUserIds } };
    } else if (targetAudience === "inactive_7d" || targetAudience === "inactive_30d") {
      const days = targetAudience === "inactive_7d" ? 7 : 30;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);

      // Find users who haven't logged in since cutoff
      const activeUserIds = await LoginDetail.distinct("user", { time: { $gte: cutoff } });
      query = {
        _id: { $nin: activeUserIds },
        createdAt: { $lt: cutoff }
      };
    } else if (targetAudience === "specific_user") {
      if (!targetValue) {
        return res.status(400).json({ success: false, error: "Target user email or name is required for Single User target" });
      }
      const searchStr = targetValue.trim();
      const escapedStr = searchStr.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      query = {
        $or: [
          { email: { $regex: new RegExp("^" + escapedStr + "$", "i") } },
          { name: { $regex: new RegExp("^" + escapedStr + "$", "i") } }
        ]
      };
    }

    const targetUsers = await User.find(query).select("name email");

    if (targetAudience === "specific_user" && targetUsers.length === 0) {
      return res.status(404).json({ success: false, error: `No user found matching email or name: "${targetValue}"` });
    }
    
    // 2. Create Campaign
    const campaign = new EmailCampaign({
      name,
      template: templateId,
      targetAudience,
      totalRecipients: targetUsers.length,
      status: targetUsers.length > 0 ? "sending" : "completed"
    });

    await campaign.save();

    // 3. Queue emails
    if (targetUsers.length > 0) {
      const queueItems = targetUsers.map(user => {
        const trackingId = crypto.randomBytes(16).toString("hex");
        return {
          campaign: campaign._id,
          user: user._id,
          toEmail: user.email,
          subject: subjectOverride || template.subject,
          html: template.html,
          trackingId,
          status: "pending"
        };
      });

      await EmailQueue.insertMany(queueItems);
    }

    res.status(201).json({
      success: true,
      message: `Campaign created and queued for ${targetUsers.length} users successfully!`,
      data: campaign
    });

  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getCampaignDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const campaign = await EmailCampaign.findById(id).populate("template");
    if (!campaign) return res.status(404).json({ success: false, message: "Campaign not found" });

    // Fetch tracking logs
    const trackingLogs = await EmailTrackingLog.find({ campaign: id })
      .populate("user", "name email user_type")
      .sort({ timestamp: -1 })
      .limit(100);

    // Fetch queue summary
    const totalQueued = await EmailQueue.countDocuments({ campaign: id });
    const pendingCount = await EmailQueue.countDocuments({ campaign: id, status: "pending" });
    const sendingCount = await EmailQueue.countDocuments({ campaign: id, status: "sending" });
    const sentCount = await EmailQueue.countDocuments({ campaign: id, status: "sent" });
    const failedCount = await EmailQueue.countDocuments({ campaign: id, status: "failed" });

    res.json({
      success: true,
      data: {
        campaign,
        queue: {
          total: totalQueued,
          pending: pendingCount,
          sending: sendingCount,
          sent: sentCount,
          failed: failedCount
        },
        trackingLogs
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteCampaign = async (req, res) => {
  const { id } = req.params;

  try {
    const campaign = await EmailCampaign.findByIdAndDelete(id);
    if (!campaign) return res.status(404).json({ success: false, message: "Campaign not found" });

    // Clean up associated queue items and tracking logs
    await EmailQueue.deleteMany({ campaign: id });
    await EmailTrackingLog.deleteMany({ campaign: id });

    res.json({ success: true, message: "Campaign and associated data deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// ==========================================
// GENERAL ANALYTICS DASHBOARD
// ==========================================

exports.getMarketingStats = async (req, res) => {
  try {
    const [
      smtpCount,
      templateCount,
      campaignCount,
      totalQueueCount,
      pendingQueueCount,
      sentQueueCount,
      failedQueueCount,
      totalOpens,
      totalClicks,
      totalConversions
    ] = await Promise.all([
      SmtpCredential.countDocuments(),
      EmailTemplate.countDocuments(),
      EmailCampaign.countDocuments(),
      EmailQueue.countDocuments(),
      EmailQueue.countDocuments({ status: "pending" }),
      EmailQueue.countDocuments({ status: "sent" }),
      EmailQueue.countDocuments({ status: "failed" }),
      EmailTrackingLog.countDocuments({ action: "open" }),
      EmailTrackingLog.countDocuments({ action: "click" }),
      EmailTrackingLog.countDocuments({ action: "conversion" })
    ]);

    const activeSmtps = await SmtpCredential.find({ active: true });
    
    // Aggregated stats over time (grouped by day)
    const statsHistory = await EmailTrackingLog.aggregate([
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
            action: "$action"
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.date": 1 } }
    ]);

    // Format logs for time-series charts
    const chartDataMap = {};
    statsHistory.forEach(log => {
      const date = log._id.date;
      const action = log._id.action;
      if (!chartDataMap[date]) {
        chartDataMap[date] = { date, opens: 0, clicks: 0, conversions: 0 };
      }
      if (action === "open") chartDataMap[date].opens = log.count;
      if (action === "click") chartDataMap[date].clicks = log.count;
      if (action === "conversion") chartDataMap[date].conversions = log.count;
    });

    const timelineData = Object.values(chartDataMap).sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      success: true,
      data: {
        smtp: {
          total: smtpCount,
          active: activeSmtps.length
        },
        templates: {
          total: templateCount
        },
        campaigns: {
          total: campaignCount
        },
        queue: {
          total: totalQueueCount,
          pending: pendingQueueCount,
          sent: sentQueueCount,
          failed: failedQueueCount
        },
        tracking: {
          opens: totalOpens,
          clicks: totalClicks,
          conversions: totalConversions,
          openRate: sentQueueCount > 0 ? ((totalOpens / sentQueueCount) * 100).toFixed(1) : 0,
          clickRate: sentQueueCount > 0 ? ((totalClicks / sentQueueCount) * 100).toFixed(1) : 0,
          conversionRate: totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : 0
        },
        timelineData
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.searchUsers = async (req, res) => {
  const { q } = req.query;
  try {
    if (!q || q.trim().length < 2) {
      return res.json({ success: true, data: [] });
    }
    const searchStr = q.trim();
    const escapedQ = searchStr.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const users = await User.find({
      $or: [
        { email: { $regex: new RegExp(escapedQ, "i") } },
        { name: { $regex: new RegExp(escapedQ, "i") } }
      ]
    })
    .select("name email")
    .limit(10);
    
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
