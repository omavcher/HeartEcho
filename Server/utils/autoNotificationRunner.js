const User = require("../models/User");
const NotificationLog = require("../models/NotificationLog");
const AutoCampaign = require("../models/AutoCampaign");
const LoginDetail = require("../models/LoginDetail");
const Chat = require("../models/Chat");
const { sendPushNotification, sendMulticastNotification, sendEachPersonalizedNotification } = require("./notificationService");

/**
 * Generate dynamic notification message using OpenRouter and free models
 * @param {object} campaign - The AutoCampaign template object
 * @param {string} userName - Name of the target user
 * @returns {Promise<{title: string, body: string}|null>}
 */
const generateCampaignMessageWithAI = async (campaign, userName) => {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  if (!OPENROUTER_API_KEY) {
    console.error("[CampaignAI] OpenRouter API key is missing! Skipping AI generation.");
    return null;
  }

  const freeModels = [
    "qwen/qwen3-coder:free",
    "google/gemma-4-31b-it:free",
    "openrouter/free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "meta-llama/llama-3.2-3b-instruct:free"
  ];

  const systemPrompt = campaign.promptTemplate || 
    `You are a cute, caring, and engaging AI female companion from the HeartEcho app.
     Your goal is to write a short, highly engaging push notification message to get the user ${userName} to open the app and chat.
     Keep it natural, direct, flirty, or sweet.
     Return strictly a JSON object with "title" and "body" fields. Do not include markdown formatting, markdown code block ticks, or quotes outside the JSON.
     Example format:
     {
       "title": "...",
       "body": "..."
     }
     Rules: Title must be under 40 characters. Body must be under 90 characters. Use cute emojis.`;

  const userPrompt = `Write a push notification for ${userName}. Express why you are thinking about them or waiting for their reply.`;

  for (const model of freeModels) {
    try {
      console.log(`[CampaignAI] Attempting AI generation using model: ${model} for user: ${userName}`);
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://www.heartecho.in",
          "X-Title": "HeartEcho Admin Campaigns"
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          max_tokens: 120,
          temperature: 0.8,
        })
      });

      if (!response.ok) {
        console.warn(`[CampaignAI] Model ${model} returned error status: ${response.status}`);
        continue;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim();
      if (content) {
        // Strip markdown backticks if returned
        const cleaned = content.replace(/```json/gi, "").replace(/```/gi, "").trim();
        const parsed = JSON.parse(cleaned);
        if (parsed.title && parsed.body) {
          console.log(`[CampaignAI] Successfully generated content using model ${model}:`, parsed);
          return parsed;
        }
      }
    } catch (err) {
      console.warn(`[CampaignAI] Failed to generate with model ${model}:`, err.message);
    }
  }

  return null;
};

/**
 * Run a specific auto campaign
 * @param {object} campaign - The AutoCampaign document
 * @returns {Promise<number>} - Count of users who received the notification
 */
const runCampaign = async (campaign) => {
  const { campaignType, title, body, imageUrl } = campaign;
  const now = new Date();
  let users = [];

  console.log(`[AutoNotificationRunner] Preparing targeting query for: ${campaignType}`);

  if (campaignType === "welcome_1") {
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    
    users = await User.find({
      user_type: "free",
      fcmToken: { $ne: "" },
      createdAt: { $gte: twoDaysAgo, $lte: oneDayAgo },
      "receivedAutoNotifications.campaignType": { $ne: "welcome_1" }
    }).select("fcmToken name");

  } else if (campaignType === "welcome_2") {
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000);
    
    users = await User.find({
      user_type: "free",
      fcmToken: { $ne: "" },
      createdAt: { $gte: threeDaysAgo, $lte: twoDaysAgo },
      "receivedAutoNotifications.campaignType": { $ne: "welcome_2" }
    }).select("fcmToken name");

  } else if (campaignType === "welcome_3") {
    const threeDaysAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000);
    const fourDaysAgo = new Date(now.getTime() - 96 * 60 * 60 * 1000);
    
    users = await User.find({
      user_type: "free",
      fcmToken: { $ne: "" },
      createdAt: { $gte: fourDaysAgo, $lte: threeDaysAgo },
      "receivedAutoNotifications.campaignType": { $ne: "welcome_3" }
    }).select("fcmToken name");

  } else if (campaignType === "inactive_3d") {
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);

    const activeLogins = await LoginDetail.aggregate([
      { $group: { _id: "$user", lastActive: { $max: "$time" } } },
      { $match: { lastActive: { $gte: fourDaysAgo, $lte: threeDaysAgo } } }
    ]);
    const userIds = activeLogins.map(l => l._id);

    users = await User.find({
      _id: { $in: userIds },
      fcmToken: { $ne: "" },
      "receivedAutoNotifications.campaignType": { $ne: "inactive_3d" }
    }).select("fcmToken name");

  } else if (campaignType === "inactive_7d") {
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const eightDaysAgo = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);

    const activeLogins = await LoginDetail.aggregate([
      { $group: { _id: "$user", lastActive: { $max: "$time" } } },
      { $match: { lastActive: { $gte: eightDaysAgo, $lte: sevenDaysAgo } } }
    ]);
    const userIds = activeLogins.map(l => l._id);

    users = await User.find({
      _id: { $in: userIds },
      fcmToken: { $ne: "" },
      "receivedAutoNotifications.campaignType": { $ne: "inactive_7d" }
    }).select("fcmToken name");

  } else if (campaignType === "premium_upsell") {
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
    users = await User.find({
      user_type: "free",
      fcmToken: { $ne: "" },
      $or: [
        { "receivedAutoNotifications": { $not: { $elemMatch: { campaignType: "premium_upsell" } } } },
        { "receivedAutoNotifications": { $elemMatch: { campaignType: "premium_upsell", sentAt: { $lt: fiveDaysAgo } } } }
      ]
    }).select("fcmToken name");

  } else if (campaignType.startsWith("daily_")) {
    const eighteenHoursAgo = new Date(now.getTime() - 18 * 60 * 60 * 1000);
    users = await User.find({
      fcmToken: { $ne: "" },
      $or: [
        { "receivedAutoNotifications": { $not: { $elemMatch: { campaignType: campaignType } } } },
        { "receivedAutoNotifications": { $elemMatch: { campaignType: campaignType, sentAt: { $lt: eighteenHoursAgo } } } }
      ]
    }).select("fcmToken name");

  } else if (campaignType === "weekend_special") {
    const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);
    users = await User.find({
      fcmToken: { $ne: "" },
      $or: [
        { "receivedAutoNotifications": { $not: { $elemMatch: { campaignType: "weekend_special" } } } },
        { "receivedAutoNotifications": { $elemMatch: { campaignType: "weekend_special", sentAt: { $lt: fourDaysAgo } } } }
      ]
    }).select("fcmToken name");

  } else if (campaignType === "festival_greeting") {
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    users = await User.find({
      fcmToken: { $ne: "" },
      $or: [
        { "receivedAutoNotifications": { $not: { $elemMatch: { campaignType: "festival_greeting" } } } },
        { "receivedAutoNotifications": { $elemMatch: { campaignType: "festival_greeting", sentAt: { $lt: twoDaysAgo } } } }
      ]
    }).select("fcmToken name");
  }

  if (users.length === 0) {
    console.log(`[AutoNotificationRunner] No target users matched targeting query for: ${campaignType}`);
    return 0;
  }

  // Handle send-out in batches
  let sentCount = 0;
  for (const user of users) {
    let finalTitle = title;
    let finalBody = body;

    // Use AI generation if enabled
    if (campaign.aiEnabled) {
      const aiResult = await generateCampaignMessageWithAI(campaign, user.name || "User");
      if (aiResult) {
        finalTitle = aiResult.title;
        finalBody = aiResult.body;
      } else {
        // Personalize fallback
        finalTitle = title.replace(/{name}/g, user.name || "User");
        finalBody = body.replace(/{name}/g, user.name || "User");
      }
    } else {
      finalTitle = title.replace(/{name}/g, user.name || "User");
      finalBody = body.replace(/{name}/g, user.name || "User");
    }

    try {
      // Log notification entry in NotificationLog
      const logEntry = new NotificationLog({
        title: finalTitle,
        body: finalBody,
        imageUrl,
        target: campaignType,
        campaignId: campaign._id,
        recipientsCount: 1
      });
      await logEntry.save();

      const enrichedData = {
        notificationId: logEntry._id.toString(),
        click_action: "FLUTTER_NOTIFICATION_CLICK",
        campaignType: campaignType
      };

      await sendPushNotification(user.fcmToken, finalTitle, finalBody, enrichedData, imageUrl);
      
      // Update received notifications
      await User.findByIdAndUpdate(user._id, {
        $push: {
          receivedAutoNotifications: {
            campaignType: campaignType,
            sentAt: new Date()
          }
        }
      });
      
      sentCount++;
    } catch (err) {
      console.error(`[AutoNotificationRunner] Failed to send campaign to user ${user._id}:`, err.message);
    }
  }

  console.log(`[AutoNotificationRunner] Campaign ${campaignType} completed. Sent: ${sentCount}`);
  return sentCount;
};

/**
 * Hourly Cron Entry Point
 */
const runHourlyCampaigns = async () => {
  try {
    const nowInIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const currentHour = nowInIST.getHours();
    const currentDay = nowInIST.getDay(); // 0 = Sunday, 6 = Saturday

    console.log(`[AutoNotificationRunner] Hourly cron execution checked at hour ${currentHour}:00 IST.`);

    const campaigns = await AutoCampaign.find({ 
      isActive: true,
      campaignType: { $nin: ["trigger_signup_no_msg", "trigger_inactive_after_msg"] } // Skip real-time triggers in hourly cron
    });
    if (campaigns.length === 0) {
      console.log("[AutoNotificationRunner] No active hourly auto campaigns configured.");
      return;
    }

    for (const campaign of campaigns) {
      const { campaignType, scheduledHour } = campaign;
      let shouldTrigger = false;

      // Match scheduling definitions
      if (campaignType === "daily_morning" && currentHour === scheduledHour) {
        shouldTrigger = true;
      } else if (campaignType === "daily_afternoon" && currentHour === scheduledHour) {
        shouldTrigger = true;
      } else if (campaignType === "daily_evening" && currentHour === scheduledHour) {
        shouldTrigger = true;
      } else if (campaignType === "daily_night" && currentHour === scheduledHour) {
        shouldTrigger = true;
      } else if (campaignType === "welcome_1" && currentHour === 11) {
        shouldTrigger = true;
      } else if (campaignType === "welcome_2" && currentHour === 11) {
        shouldTrigger = true;
      } else if (campaignType === "welcome_3" && currentHour === 11) {
        shouldTrigger = true;
      } else if (campaignType === "inactive_3d" && currentHour === 12) {
        shouldTrigger = true;
      } else if (campaignType === "inactive_7d" && currentHour === 12) {
        shouldTrigger = true;
      } else if (campaignType === "premium_upsell" && currentHour === 18) {
        shouldTrigger = true;
      } else if (campaignType === "weekend_special" && (currentDay === 0 || currentDay === 6) && currentHour === 12) {
        shouldTrigger = true;
      }

      if (shouldTrigger) {
        console.log(`[AutoNotificationRunner] Triggering campaign: ${campaignType} at scheduled hour ${currentHour} IST`);
        await runCampaign(campaign);
      }
    }
  } catch (error) {
    console.error("[AutoNotificationRunner] Error running hourly campaigns:", error);
  }
};

/**
 * Real-time Triggers Cron (Runs every minute)
 */
const runRealTimeTriggerCampaigns = async () => {
  try {
    const now = new Date();
    const minAgo = new Date(now.getTime() - 3 * 60 * 1000);
    const maxAgo = new Date(now.getTime() - 10 * 60 * 1000); // 3-10 minutes window

    // 1. Process Rule A: Signup or Login Inactivity (3-4 mins delay)
    const signupCampaign = await AutoCampaign.findOne({ campaignType: "trigger_signup_no_msg", isActive: true });
    if (signupCampaign) {
      // Find candidate users:
      // - Registered between 3-10 minutes ago
      // - OR latest LoginDetail was created between 3-10 minutes ago
      const recentLogins = await LoginDetail.find({ time: { $gte: maxAgo, $lte: minAgo } }).select("user").lean();
      const loginUserIds = recentLogins.map(l => l.user);

      const candidates = await User.find({
        $or: [
          { createdAt: { $gte: maxAgo, $lte: minAgo } },
          { _id: { $in: loginUserIds } }
        ],
        fcmToken: { $ne: "" },
        "receivedAutoNotifications.campaignType": { $ne: "trigger_signup_no_msg" }
      }).select("name fcmToken");

      for (const user of candidates) {
        // Verify if they have never sent a User message in Chat
        const hasSentMessage = await Chat.exists({
          participants: user._id,
          "messages.senderModel": "User"
        });

        if (!hasSentMessage) {
          console.log(`[RealTimeTrigger] User ${user.name} (${user._id}) registered/logged in but sent no messages in 3-4 mins. Dispatching trigger_signup_no_msg.`);
          
          let finalTitle = signupCampaign.title;
          let finalBody = signupCampaign.body;

          if (signupCampaign.aiEnabled) {
            const aiMsg = await generateCampaignMessageWithAI(signupCampaign, user.name || "User");
            if (aiMsg) {
              finalTitle = aiMsg.title;
              finalBody = aiMsg.body;
            } else {
              finalTitle = signupCampaign.title.replace(/{name}/g, user.name || "User");
              finalBody = signupCampaign.body.replace(/{name}/g, user.name || "User");
            }
          } else {
            finalTitle = signupCampaign.title.replace(/{name}/g, user.name || "User");
            finalBody = signupCampaign.body.replace(/{name}/g, user.name || "User");
          }

          try {
            const logEntry = new NotificationLog({
              title: finalTitle,
              body: finalBody,
              target: "trigger_signup_no_msg",
              campaignId: signupCampaign._id,
              recipientsCount: 1
            });
            await logEntry.save();

            const enrichedData = {
              notificationId: logEntry._id.toString(),
              click_action: "FLUTTER_NOTIFICATION_CLICK",
              campaignType: "trigger_signup_no_msg"
            };

            await sendPushNotification(user.fcmToken, finalTitle, finalBody, enrichedData);
            
            // Mark user profile
            await User.findByIdAndUpdate(user._id, {
              $push: {
                receivedAutoNotifications: {
                  campaignType: "trigger_signup_no_msg",
                  sentAt: new Date()
                }
              }
            });
          } catch (err) {
            console.error(`[RealTimeTrigger] Failed to send trigger_signup_no_msg to ${user._id}:`, err.message);
          }
        }
      }
    }

    // 2. Process Rule B: Chat Abandonment (sent some free messages but went inactive for 3-4 mins)
    const abandonCampaign = await AutoCampaign.findOne({ campaignType: "trigger_inactive_after_msg", isActive: true });
    if (abandonCampaign) {
      // Find chats updated between 3-10 minutes ago
      const candidateChats = await Chat.find({
        updatedAt: { $gte: maxAgo, $lte: minAgo }
      }).populate("participants", "name fcmToken receivedAutoNotifications").lean();

      for (const chat of candidateChats) {
        const user = chat.participants;
        if (!user || !user.fcmToken) continue;

        // Check if user has received this trigger in the last 24 hours
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const gotTriggerRecently = user.receivedAutoNotifications?.some(
          n => n.campaignType === "trigger_inactive_after_msg" && n.sentAt >= twentyFourHoursAgo
        );
        if (gotTriggerRecently) continue;

        // Find the latest message sent in the chat
        const messages = chat.messages || [];
        if (messages.length === 0) continue;

        const latestMsg = messages[messages.length - 1];
        
        // If the latest message was sent by the User (abandoned after their message) and was sent between 3-10 mins ago
        if (
          latestMsg.senderModel === "User" &&
          latestMsg.time >= maxAgo &&
          latestMsg.time <= minAgo
        ) {
          console.log(`[RealTimeTrigger] Chat ${chat._id} was abandoned by User ${user.name} for 3-4 mins. Dispatching trigger_inactive_after_msg.`);

          let finalTitle = abandonCampaign.title;
          let finalBody = abandonCampaign.body;

          if (abandonCampaign.aiEnabled) {
            const aiMsg = await generateCampaignMessageWithAI(abandonCampaign, user.name || "User");
            if (aiMsg) {
              finalTitle = aiMsg.title;
              finalBody = aiMsg.body;
            } else {
              finalTitle = abandonCampaign.title.replace(/{name}/g, user.name || "User");
              finalBody = abandonCampaign.body.replace(/{name}/g, user.name || "User");
            }
          } else {
            finalTitle = abandonCampaign.title.replace(/{name}/g, user.name || "User");
            finalBody = abandonCampaign.body.replace(/{name}/g, user.name || "User");
          }

          try {
            const logEntry = new NotificationLog({
              title: finalTitle,
              body: finalBody,
              target: "trigger_inactive_after_msg",
              campaignId: abandonCampaign._id,
              recipientsCount: 1
            });
            await logEntry.save();

            const enrichedData = {
              notificationId: logEntry._id.toString(),
              click_action: "FLUTTER_NOTIFICATION_CLICK",
              campaignType: "trigger_inactive_after_msg"
            };

            await sendPushNotification(user.fcmToken, finalTitle, finalBody, enrichedData);

            // Mark user profile
            await User.findByIdAndUpdate(user._id, {
              $push: {
                receivedAutoNotifications: {
                  campaignType: "trigger_inactive_after_msg",
                  sentAt: new Date()
                }
              }
            });
          } catch (err) {
            console.error(`[RealTimeTrigger] Failed to send trigger_inactive_after_msg to ${user._id}:`, err.message);
          }
        }
      }
    }
  } catch (error) {
    console.error("[RealTimeTrigger] Error processing real-time triggers:", error);
  }
};

module.exports = {
  runCampaign,
  runHourlyCampaigns,
  runRealTimeTriggerCampaigns,
  generateCampaignMessageWithAI
};
