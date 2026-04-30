const admin = require("../config/firebaseAdmin");

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
};
