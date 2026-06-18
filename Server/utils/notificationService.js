const admin = require("../config/firebaseAdmin");
const User = require("../models/User");

/**
 * Helper to clean up invalid FCM tokens in the database
 * @param {string[]} tokens - Array of invalid tokens to clear
 */
const cleanupInvalidTokens = async (tokens) => {
  if (!tokens || tokens.length === 0) return;
  try {
    const result = await User.updateMany(
      { fcmToken: { $in: tokens } },
      { $set: { fcmToken: "", isMobileUser: false } }
    );
    console.log(`[FCM Invalidation] Cleaned up ${result.modifiedCount} invalid FCM tokens from uninstalled/cleared apps.`);
  } catch (error) {
    console.error("Error cleaning up invalid FCM tokens:", error);
  }
};

/**
 * Sends a push notification to a specific device
 * @param {string} fcmToken - The device's FCM token
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Optional data payload
 */
const sendPushNotification = async (fcmToken, title, body, data = {}, imageUrl = null) => {
  if (!fcmToken) {
    console.log("No FCM token provided, skipping notification.");
    return;
  }

  const message = {
    notification: {
      title: title,
      body: body,
      ...(imageUrl && { image: imageUrl })
    },
    data: data,
    token: fcmToken,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("Successfully sent message:", response);
    return response;
  } catch (error) {
    console.error("Error sending message:", error);
    
    // Check if token is invalid/unregistered
    const code = error.code || (error.errorInfo && error.errorInfo.code);
    if (
      code === 'messaging/registration-token-not-registered' ||
      code === 'messaging/invalid-registration-token' ||
      error.message?.includes('not-registered') ||
      error.message?.includes('invalid-registration-token')
    ) {
      await cleanupInvalidTokens([fcmToken]);
    }
    
    throw error;
  }
};

/**
 * Sends a push notification to multiple devices
 * @param {string[]} tokens - Array of FCM tokens
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Optional data payload
 */
const sendMulticastNotification = async (tokens, title, body, data = {}, imageUrl = null) => {
  if (!tokens || tokens.length === 0) return;

  const message = {
    notification: {
      title,
      body,
      ...(imageUrl && { image: imageUrl })
    },
    data,
    tokens,
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`${response.successCount} messages were sent successfully`);
    
    // Check for invalid tokens in the responses batch
    if (response.responses && response.responses.length > 0) {
      const invalidTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success && resp.error) {
          const code = resp.error.code;
          if (
            code === 'messaging/registration-token-not-registered' ||
            code === 'messaging/invalid-registration-token'
          ) {
            invalidTokens.push(tokens[idx]);
          }
        }
      });
      if (invalidTokens.length > 0) {
        await cleanupInvalidTokens(invalidTokens);
      }
    }
    
    return response;
  } catch (error) {
    console.error("Error sending multicast message:", error);
    throw error;
  }
};

/**
 * Sends individual personalized notifications
 * @param {object[]} messages - Array of FCM message objects
 */
const sendEachPersonalizedNotification = async (messages) => {
  if (!messages || messages.length === 0) return;

  try {
    const response = await admin.messaging().sendEach(messages);
    console.log(`${response.successCount} personalized messages were sent successfully`);
    
    // Check for invalid tokens in the responses batch
    if (response.responses && response.responses.length > 0) {
      const invalidTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success && resp.error) {
          const code = resp.error.code;
          if (
            code === 'messaging/registration-token-not-registered' ||
            code === 'messaging/invalid-registration-token'
          ) {
            invalidTokens.push(messages[idx].token);
          }
        }
      });
      if (invalidTokens.length > 0) {
        await cleanupInvalidTokens(invalidTokens);
      }
    }
    
    return response;
  } catch (error) {
    console.error("Error sending personalized messages:", error);
    throw error;
  }
};

module.exports = {
  sendPushNotification,
  sendMulticastNotification,
  sendEachPersonalizedNotification,
  attributePremiumConversion: async (userId, planType, amount) => {
    try {
      const NotificationLog = require("../models/NotificationLog");
      // Find the latest notification click by this user in the last 48 hours
      const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
      const lastClickLog = await NotificationLog.findOne({
        "clicks.user": userId,
        sentAt: { $gte: fortyEightHoursAgo }
      }).sort({ sentAt: -1 });

      if (lastClickLog) {
        // Check if user already converted for this log to prevent duplicate counts
        const alreadyConverted = lastClickLog.conversions.some(
          c => c.user.toString() === userId.toString()
        );
        if (!alreadyConverted) {
          await NotificationLog.findByIdAndUpdate(lastClickLog._id, {
            $inc: { conversionsCount: 1 },
            $push: {
              conversions: {
                user: userId,
                convertedAt: new Date(),
                planType: planType || "premium",
                amount: amount || 0
              }
            }
          });
          console.log(`[Conversion Attribution] Attributed conversion of user ${userId} to notification campaign: ${lastClickLog.title}`);
        }
      }
    } catch (error) {
      console.error("Error attributing premium conversion:", error);
    }
  }
};
