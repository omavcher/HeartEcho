const admin = require("../config/firebaseAdmin");

/**
 * Sends a push notification to a specific device
 * @param {string} fcmToken - The device's FCM token
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Optional data payload
 */
const sendPushNotification = async (fcmToken, title, body, data = {}) => {
  if (!fcmToken) {
    console.log("No FCM token provided, skipping notification.");
    return;
  }

  const message = {
    notification: {
      title: title,
      body: body,
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
const sendMulticastNotification = async (tokens, title, body, data = {}) => {
  if (!tokens || tokens.length === 0) return;

  const message = {
    notification: {
      title,
      body,
    },
    data,
    tokens,
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`${response.successCount} messages were sent successfully`);
    return response;
  } catch (error) {
    console.error("Error sending multicast message:", error);
    throw error;
  }
};

module.exports = {
  sendPushNotification,
  sendMulticastNotification,
};
