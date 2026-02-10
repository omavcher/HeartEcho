const mongoose = require("mongoose");
const PrebuiltAIFriend = require("../models/PrebuiltAIFriend");
const User = require("../models/User");
const AIFriend = require("../models/AIFriend");
const Chat = require("../models/Chat");
const LoginDetail = require("../models/LoginDetail");
const moment = require("moment");  // Add this line if using Moment.js
const Ticket = require("../models/Ticket");
const nodemailer = require("nodemailer");
const Payment = require("../models/Payment");
const axios = require("axios");

require("dotenv").config();



exports.getProfile = async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select("-password");
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  exports.verifyUser = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(400).json({ status: false, message: "User ID not found" });
        }

        const user = await User.findById(req.user.id);
        if (user) {
            res.json({ status: true, email: user.email });
        } else {
            res.json({ status: false });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id; 
    const { profile_picture, phone_number, age, selectedInterests } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "❌ User ID is missing!" });
    }

    // Update the user profile in the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profile_picture, phone_number, age, selectedInterests },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "❌ User not found!" });
    }

    res.status(200).json({
      message: "✅ Profile updated successfully!",
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ Error updating profile:", error);
    res.status(500).json({ message: "⚠️ Server error! Please try again later." });
  }
};




exports.loginDetail = async (req, res) => {
  try {
    const userId = req.user.id;
    const { ip, coordinates, platform, locationUser } = req.body;

    // Convert coordinates to an object format
    const parsedCoordinates = {
      lat: coordinates?.lat || null,
      lon: coordinates?.lon || null
    };

    // Current time
    const currentTime = new Date();

    // Check if a login entry with the same IP and coordinates already exists for this user
    const existingLogin = await LoginDetail.findOne({
      user: userId,
      ip: ip,
      "coordinates.lat": parsedCoordinates.lat,
      "coordinates.lon": parsedCoordinates.lon
    });

    if (existingLogin) {
      // If found, update only the time field
      existingLogin.time = currentTime;
      await existingLogin.save();
    } else {
      // If not found, create a new login detail entry
      const newLoginDetail = new LoginDetail({
        user: userId,
        platform,
        coordinates: parsedCoordinates,
        ip,
        time: currentTime,
        location: locationUser
      });

      const response = await newLoginDetail.save();

      // Push new login ID to the user's login_details array
      await User.findByIdAndUpdate(
        userId,
        { $push: { login_details: response._id } },
        { new: true, runValidators: true }
      );
    }

    res.status(201).json({ message: "Login details updated successfully!" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "⚠️ Server error! Please try again later." });
  }
};


exports.getLoginDetail = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("login_details");

    if (!user || !user.login_details.length) {
      return res.status(404).json({ message: "❌ No login details found!" });
    }


    const loginDetails = await LoginDetail.find({ _id: { $in: user.login_details } });

    res.status(200).json(loginDetails);
  } catch (error) {
    console.error("Error fetching login details:", error);
    res.status(500).json({ message: "⚠️ Server error! Please try again later." });
  }
};


exports.getTickets = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate("tickets"); // Fetch tickets for the user

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ message: "⚠️ Server error! Please try again later." });
  }
};

exports.makeTicket = async (req, res) => {
  try {
    const userId = req.user.id;
    const { issue } = req.body;

    if (!issue) {
      return res.status(400).json({ message: "Issue description is required." });
    }

    // Create new ticket
    const newTicket = new Ticket({
      issue,
      status: "Pending",
      createdAt: new Date(),
      user: userId, // Associate ticket with the user
    });

    // Save ticket
    const savedTicket = await newTicket.save();

    // Update user's tickets array
    await User.findByIdAndUpdate(userId, {
      $push: { tickets: savedTicket._id },
    });

    res.status(201).json(savedTicket);
  } catch (error) {
    console.error("Error submitting ticket:", error);
    res.status(500).json({ message: "⚠️ Server error! Please try again later." });
  }
};


const otpDeleteStorage = new Map(); 

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// 🚀 Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Send OTP to user's email
exports.sendOtpDestroy = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOtp();
    otpDeleteStorage.set(userId, otp);

    // Send email with HTML template
    await transporter.sendMail({
      from: `"HeartEcho ❤️" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "⚠️ Confirm Your Account Deletion - OTP Inside",
      html: `
        <div style="font-family: Arial, sans-serif; background: #f8f9fa; padding: 20px; text-align: center;">
            <div style="max-width: 500px; margin: auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                <h2 style="color: #d84303;">⚠️ Are You Sure You Want to Delete Your Account?</h2>
                <p style="font-size: 16px; color: #333;">Your account deletion request has been initiated. If this was intentional, use the OTP below to confirm deletion:</p>
                <div style="font-size: 24px; font-weight: bold; color: #d84303; padding: 10px; background: #fce4ec; border-radius: 5px; display: inline-block;">
                    ${otp}
                </div>
                <p style="font-size: 14px; color: #555;">🚨 <strong>Warning:</strong> Once deleted, your account cannot be recovered.</p>
                <p style="font-size: 14px; color: #555;">This OTP is valid for <strong>10 minutes</strong>. If you did not request this, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #ddd;">
                <p style="font-size: 12px; color: #888;">© 2024 HeartEcho. All rights reserved.</p>
            </div>
        </div>`,
    });

    res.status(200).json({ message: "OTP sent to your email" , success:true });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "⚠️ Server error! Please try again later." });
  }
};



// ✅ Verify OTP
exports.verifyOtpDestroy = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otp } = req.body;

    if (!otpDeleteStorage.has(userId)) {
      return res.status(400).json({ message: "No OTP requested" });
    }

    if (otpDeleteStorage.get(userId) !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    otpDeleteStorage.delete(userId);
    res.status(200).json({ message: "OTP verified, proceed to delete account" , success:true});
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "⚠️ Server error! Please try again later." });
  }
};

// ✅ Delete user account
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Ensure OTP verification was completed
    if (otpDeleteStorage.has(userId)) {
      return res.status(400).json({ message: "OTP verification required before deleting account" });
    }

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ message: "⚠️ Server error! Please try again later." });
  }
};


exports.twoFactor = async (req, res) => {
  try {
    const userId = req.user.id;
    const { twofactor } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { twofactor },
    );

    res.json({ message: "Two-factor updated successfully", twofactor: updatedUser.twofactor });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ message: "⚠️ Server error! Please try again later." });
  }
};



exports.userType = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId); // ✅ Correct syntax
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }
    res.json({ user_type: user.user_type });
  } catch (error) {
    console.error("Error fetching user type:", error);
    res.status(500).json({ message: "⚠️ Server error! Please try again later." });
  }
};

exports.chatFriends = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const chatFriends = await Chat.aggregate([
      // Stage 1: Find ONLY chats that have messages
      {
        $match: {
          participants: userId,
          isActive: true,
          messages: { $exists: true, $not: { $size: 0 } } // Must have messages
        }
      },
      
      // Stage 2: Sort to get most recent chats first
      { $sort: { updatedAt: -1 } },
      
      // Stage 3: Get last message
      {
        $addFields: {
          lastMessage: { $arrayElemAt: ["$messages", -1] }
        }
      },
      
      // Stage 4: Lookup AI friend from AIFriend collection
      {
        $lookup: {
          from: "aifriends",
          localField: "aiParticipants",
          foreignField: "_id",
          as: "aiFriend"
        }
      },
      
      // Stage 5: Lookup AI friend from PrebuiltAIFriend collection
      {
        $lookup: {
          from: "prebuiltaifriends",
          localField: "aiParticipants",
          foreignField: "_id",
          as: "prebuiltAIFriend"
        }
      },
      
      // Stage 6: Combine AI friend data (whichever exists)
      {
        $addFields: {
          friendData: {
            $cond: {
              if: { $gt: [{ $size: "$aiFriend" }, 0] },
              then: { $arrayElemAt: ["$aiFriend", 0] },
              else: { $arrayElemAt: ["$prebuiltAIFriend", 0] }
            }
          }
        }
      },
      
      // Stage 7: Filter out chats without AI friend data
      {
        $match: {
          friendData: { $ne: null }
        }
      },
      
      // Stage 8: Count unread messages
      {
        $addFields: {
          unreadCount: {
            $size: {
              $filter: {
                input: "$messages",
                as: "msg",
                cond: {
                  $and: [
                    { $ne: ["$$msg.sender", userId] },
                    { $ne: ["$$msg.status.read", true] }
                  ]
                }
              }
            }
          }
        }
      },
      
      // Stage 9: Format the response
      {
        $project: {
          _id: "$friendData._id",
          name: "$friendData.name",
          avatar: "$friendData.avatar_img",
          lastMessage: {
            $cond: {
              if: { $eq: ["$lastMessage.mediaType", "text"] },
              then: "$lastMessage.text",
              else: { $concat: ["[", "$lastMessage.mediaType", "]"] }
            }
          },
          lastMessageTime: "$lastMessage.time",
          chatId: "$_id",
          unreadCount: 1
        }
      },
      
      // Stage 10: Sort by last message time
      {
        $sort: { lastMessageTime: -1 }
      }
    ]);

    // FILTER FUNCTION: Remove entries with "No messages yet" or null lastMessageTime
    const filterChatFriends = (friends) => {
      return friends.filter(friend => {
        // Check if lastMessage exists and is not "No messages yet"
        if (!friend.lastMessage || friend.lastMessage === "No messages yet") {
          return false;
        }
        
        // Check if lastMessageTime exists
        if (!friend.lastMessageTime) {
          return false;
        }
        
        // Check if lastMessage is a meaningful message (not empty/placeholder)
        const meaninglessMessages = [
          "No messages yet",
          "Message",
          "[text]",
          ""
        ];
        
        if (meaninglessMessages.includes(friend.lastMessage.trim())) {
          return false;
        }
        
        return true;
      });
    };

    // Apply the filter
    const filteredChatFriends = filterChatFriends(chatFriends);

    res.status(200).json(filteredChatFriends);
  } catch (error) {
    console.error("Error fetching chat friends:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


exports.chatsDatas = async (req, res) => {
  try {
    const { chatId } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ error: "Invalid Chat ID" });
    }

    // Try to find chat in `Chat` collection
    const chat = await Chat.findById(chatId)
      .populate("participants", "name image")
      .populate("aiParticipants", "name avatar")
      .populate({
        path: "messages",
        populate: {
          path: "sender",
          select: "name image",
        },
      });

    // If chat is not found, check in PrebuiltAIFriend or AIFriend
    if (!chat) {
      const aiModelData =
        (await PrebuiltAIFriend.findById(chatId).select('-img_gallery -video_gallery')) ||
        (await AIFriend.findById(chatId).select('-img_gallery -video_gallery'));

      return res.status(200).json(aiModelData || { error: "Chat not found" });
    }

    res.status(200).json({ chat });
  } catch (error) {
    console.error("Error fetching chat data:", error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
};



exports.latAichatmessage = async (req, res) => {
  try {
    const { chatId } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ error: "Invalid Chat ID" });
    }

    const chat = await Chat.findById(chatId)
      .populate("participants", "name image")
      .populate("aiParticipants", "name avatar")
      .populate({
        path: "messages",
        populate: {
          path: "sender",
          select: "name image",
        },
      });

    if (!chat) {
      const AiModelData = await AIFriend.findById(chatId);
      return res.status(200).json(AiModelData || { error: "Chat not found" });
    }

    // Find the last AI-sent message
    const lastAiMessage = chat.messages
      .filter((msg) => msg.sender && msg.sender.name === chat.aiParticipants.name)
      .pop(); // Get the last AI message

    const AiModelData = await AIFriend.findById(chatId);

    res.status(200).json({ lastAiMessage, AiModelData });
  } catch (error) {
    console.error("Error fetching chat data:", error.stack);
    res.status(500).json({ error: "Internal server error" });
  }
};




// Fisher-Yates shuffle algorithm
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

exports.getAllPreAIFriends = async (req, res) => {
  try {
    const allFriends = await PrebuiltAIFriend.find();
    const shuffledFriends = shuffleArray(allFriends);

    res.status(200).json({
      success: true,
      message: "All AI Friends retrieved successfully in random order!",
      data: shuffledFriends,
    });
  } catch (error) {
    console.error("Error fetching AI Friend data:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};



exports.getChatData = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("joinedAt messageQuota user_type subscriptionExpiry");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const today = new Date();
    let daysLeft = 0;
    let messageQuota = user.messageQuota;

    if (user.user_type === "subscriber" && user.subscriptionExpiry) {
      const expiryDate = new Date(user.subscriptionExpiry);
      daysLeft = Math.max(Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24)), 0);
      messageQuota = 999; // Unlimited quota for subscribers
    } else {
      // Free user logic: 7 days free quota
      const joinedAt = new Date(user.joinedAt);
      const daysSinceJoined = Math.floor((today - joinedAt) / (1000 * 60 * 60 * 24));
      daysLeft = Math.max(7 - daysSinceJoined, 0);
    }

    // Count total messages sent by the user from Chat model
    const messagesSent = await Chat.aggregate([
      { $match: { "messages.sender": user._id } },
      { $unwind: "$messages" },
      { $match: { "messages.sender": user._id } },
      { $count: "totalMessages" }
    ]);

    res.status(200).json({
      joinedAt: user.joinedAt,
      messageQuota,
      userType: user.user_type,
      daysLeft,
      totalMessagesSent: messagesSent.length > 0 ? messagesSent[0].totalMessages : 0,
    });

  } catch (error) {
    console.error("Error fetching chat data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


exports.deleteMessage = async (req, res) => {
  try {
    const { chatId, messageId } = req.params;
    
    await Chat.findByIdAndUpdate(chatId, {
      $pull: { messages: { _id: messageId } },
    });

    res.json({ success: true, message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting message" });
  }
};



exports.paymentSave = async (req, res) => {
  try {
    const { user, rupees, transaction_id } = req.body;

    if (!user || !rupees || !transaction_id) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Find user
    const existingUser = await User.findById(user);
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Calculate new expiry date
    let expiryDate = new Date();
    
    if (existingUser.subscriptionExpiry && existingUser.subscriptionExpiry > expiryDate) {
      expiryDate = new Date(existingUser.subscriptionExpiry); // Use existing expiry if it's in the future
    }

    if (rupees === 49) {
      expiryDate.setMonth(expiryDate.getMonth() + 1); // Increase 1 month
    } else if (rupees === 399) {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1); // Increase 1 year
    }

    // Create new payment entry
    const payment = new Payment({
      user,
      rupees,
      transaction_id,
      expiry_date: expiryDate,
    });

    await payment.save();

    // Update user subscription with new expiry date
    const updatedUser = await User.findByIdAndUpdate(
      user,
      {
        $set: { user_type: "subscriber", subscriptionExpiry: expiryDate },
        $push: { payment_history: payment._id },
      },
      { new: true }
    );

    res.status(201).json({
      success: true,
      message: "Payment saved and subscription updated successfully",
      updatedUser,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error saving payment and updating user" });
  }
};


exports.getPaymentData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user details with payment info
    const user = await User.findById(userId)
      .select("name profile_picture subscriptionExpiry")
      .populate("payment_history"); // Correct reference

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Fetch user's payment history sorted by latest transaction
    const payments = await Payment.find({ user: userId }).sort({ date: -1 });

    // Determine next subscription renewal date
    const nextSubscriptionDate = user.subscriptionExpiry
      ? new Date(user.subscriptionExpiry).toLocaleDateString("en-GB")
      : "No Active Subscription";

    res.status(200).json({
      name: user.name,
      profilePicture: user.profile_picture || "", // Default if no profile picture
      nextSubscriptionDate,
      paymentHistory: payments,
    });
  } catch (error) {
    console.error("Error fetching payment data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


// Check subscription status
exports.getSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("user_type subscriptionExpiry messageQuota messagesUsedToday lastQuotaReset");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Reset quota if needed
    user.resetDailyQuota();
    await user.save();

    const isSubscribed = user.isSubscriptionActive();
    const remainingQuota = user.getRemainingQuota();
    const daysUntilExpiry = user.subscriptionExpiry 
      ? Math.ceil((user.subscriptionExpiry - new Date()) / (1000 * 60 * 60 * 24))
      : 0;

    res.status(200).json({
      isSubscribed,
      remainingQuota,
      userType: user.user_type,
      subscriptionExpiry: user.subscriptionExpiry,
      daysUntilExpiry: Math.max(0, daysUntilExpiry),
      messageQuota: user.messageQuota,
      messagesUsedToday: user.messagesUsedToday
    });
  } catch (error) {
    console.error("Error checking subscription status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update subscription (for payment success)
exports.updateSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { durationType, paymentDetails } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update subscription
    await user.updateSubscription(durationType);

    // Save payment record if provided
    if (paymentDetails) {
      const payment = new Payment({
        user: userId,
        rupees: paymentDetails.amount,
        transaction_id: paymentDetails.transactionId,
        expiry_date: user.subscriptionExpiry,
        plan_type: durationType
      });
      await payment.save();

      // Add to user's payment history
      user.payment_history.push(payment._id);
      await user.save();
    }

    const updatedUser = await User.findById(userId).select("user_type subscriptionExpiry");

    res.status(200).json({
      success: true,
      message: "Subscription updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get subscription plans
exports.getSubscriptionPlans = async (req, res) => {
  try {
    const plans = [
      {
        id: "free",
        name: "Free Plan",
        price: 0,
        duration: "forever",
        features: [
          "20 messages per day",
          "Basic AI responses",
          "Standard chat features"
        ],
        messageQuota: 20
      },
      {
        id: "monthly",
        name: "Monthly Pro",
        price: 49,
        duration: "month",
        features: [
          "Unlimited messages",
          "Priority responses",
          "Media generation",
          "Advanced AI models"
        ],
        messageQuota: 999
      },
      {
        id: "yearly",
        name: "Yearly Pro",
        price: 399,
        duration: "year",
        features: [
          "Unlimited messages",
          "Priority responses",
          "Media generation",
          "Advanced AI models",
          "Save 30% vs monthly"
        ],
        messageQuota: 999
      }
    ];

    res.status(200).json({ plans });
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Check message quota before sending
exports.checkMessageQuota = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cost = 1 } = req.body; // Default cost is 1 for text messages

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const canSend = user.canSendMessage(cost);
    const remainingQuota = user.getRemainingQuota();

    res.status(200).json({
      canSend,
      remainingQuota,
      isSubscribed: user.isSubscriptionActive(),
      requiredCost: cost
    });
  } catch (error) {
    console.error("Error checking message quota:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
exports.autoNotificationsGen = async (req, res) => {
  try {
    // Get userId if available (for logged-in users)
    const userId = req.user ? req.user.id : null;
    const { latitude, longitude } = req.body;
    
    // User data - handle both logged-in and non-logged-in scenarios
    let user = null;
    let userCity = "Unknown"; // Default value
    let userName = "there";
    let userInterests = [];
    let userLoginDetails = [];
    
    if (userId) {
      // Fetch user data for personalized messages (logged-in users only)
      user = await User.findById(userId).select('name age selectedInterests login_details');
      if (user) {
        userName = user.name || "there";
        userInterests = user.selectedInterests || [];
        userLoginDetails = user.login_details || [];
      }
    }
    
    // Get city from coordinates using Mapbox API
    if (latitude && longitude) {
      try {
        console.log(`Fetching location for coordinates: ${latitude}, ${longitude}`);
        
        const mapboxResponse = await axios.get(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json`,
          {
            params: {
              access_token: process.env.MAPBOX_ACCESS_TOKEN,
              types: 'place,locality,neighborhood', // Added neighborhood
              limit: 5 // Get more results to find the best match
            }
          }
        );
        
        if (mapboxResponse.data && mapboxResponse.data.features && mapboxResponse.data.features.length > 0) {
          const features = mapboxResponse.data.features;
          
          // Try different strategies to get the best city name
          let foundCity = null;
          
          // Strategy 1: Look for place (city)
          for (const feature of features) {
            if (feature.place_type && feature.place_type.includes('place')) {
              if (feature.text) {
                userCity = feature.text;
                console.log(`Found city (place): ${userCity}`);
                foundCity = userCity;
                break;
              }
            }
          }
          
          // Strategy 2: Look for locality
          if (!foundCity) {
            for (const feature of features) {
              if (feature.place_type && feature.place_type.includes('locality')) {
                if (feature.text) {
                  userCity = feature.text;
                  console.log(`Found city (locality): ${userCity}`);
                  foundCity = userCity;
                  break;
                }
              }
            }
          }
          
          // Strategy 3: Look for neighborhood (might be what "Chandrakiran Nagar" is)
          if (!foundCity) {
            for (const feature of features) {
              if (feature.place_type && feature.place_type.includes('neighborhood')) {
                if (feature.text) {
                  userCity = feature.text;
                  console.log(`Found area (neighborhood): ${userCity}`);
                  foundCity = userCity;
                  break;
                }
              }
            }
          }
          
          // Strategy 4: Try to get city from context
          if (!foundCity && features[0] && features[0].context) {
            // Context items are in reverse order (smallest to largest)
            const context = features[0].context;
            
            // Look for city in context (usually place.xxxxx or locality.xxxxx)
            for (let i = context.length - 1; i >= 0; i--) {
              const item = context[i];
              if (item.id && (item.id.startsWith('place.') || item.id.startsWith('locality.'))) {
                if (item.text) {
                  userCity = item.text;
                  console.log(`Found city from context: ${userCity}`);
                  foundCity = userCity;
                  break;
                }
              }
            }
          }
          
          // Strategy 5: Use the first feature if nothing else works
          if (!foundCity && features[0].text) {
            userCity = features[0].text;
            console.log(`Using first feature as city: ${userCity}`);
          }
          
          // Clean up the city name if it's too specific
          if (userCity.includes('Nagar') || userCity.includes('Colony') || userCity.includes('Area')) {
            // Try to find a more general city name from context
            if (features[0] && features[0].context) {
              for (const item of features[0].context) {
                if (item.id && item.id.startsWith('place.')) {
                  userCity = item.text;
                  console.log(`Using general city from context instead: ${userCity}`);
                  break;
                }
              }
            }
          }
        }
        
      } catch (mapboxError) {
        console.error("Error fetching location from Mapbox:", mapboxError.message);
      }
    }
    
    // Fetch ONLY female prebuilt AI friends
    const femaleAIFriends = await PrebuiltAIFriend.find({ gender: "female" });
    
    if (femaleAIFriends.length === 0) {
      return res.status(404).json({ message: "No female AI friends available" });
    }
    
    // Get user's message history to avoid repeats
    let recentMessages = [];
    let recentFriendIds = [];
    let messageHistory = [];
    
    if (userId) {
      const userNotifications = await LoginDetail.findOne({ user: userId })
        .sort({ time: -1 })
        .select('notifications');
      
      if (userNotifications && userNotifications.notifications) {
        messageHistory = userNotifications.notifications;
        recentMessages = userNotifications.notifications
          .slice(-10)
          .map(notif => notif.message);
        recentFriendIds = userNotifications.notifications
          .slice(-5)
          .map(notif => notif.aiFriendId);
      }
    }
    
    // Track message types for the image ratio (3:10)
    const messageCounts = countMessageTypes(messageHistory);
    
    // Filter out recently sent AI friends
    let availableFriends = femaleAIFriends;
    if (recentFriendIds.length > 0) {
      availableFriends = femaleAIFriends.filter(
        friend => !recentFriendIds.includes(friend._id.toString())
      );
      
      if (availableFriends.length === 0) {
        availableFriends = femaleAIFriends;
      }
    }
    
    // Select random female AI friend
    const randomIndex = Math.floor(Math.random() * availableFriends.length);
    const randomAIFriend = availableFriends[randomIndex];
    
    // Get AI friend's city - let's assign some cities for AI friends
    const aiFriendCities = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Jaipur", "Goa", "Shimla"];
    const randomCityIndex = Math.floor(Math.random() * aiFriendCities.length);
    const aiFriendCity = aiFriendCities[randomCityIndex];
    
    // IMAGE LINKS ARRAY
    const IMAGE_LINKS = [
      "https://res.cloudinary.com/dsm6pjmxt/image/upload/v1765603456/Untitled_9_z71ddf.webp",
      "https://res.cloudinary.com/dsm6pjmxt/image/upload/v1765601490/Untitled_1_kkyaul.webp"
    ];
    
    // Function to get random image from array
    const getRandomImage = () => {
      const randomImgIndex = Math.floor(Math.random() * IMAGE_LINKS.length);
      return IMAGE_LINKS[randomImgIndex];
    };
    
    // GENERIC MESSAGES (when no personalization is available)
    const genericMessages = [
      `Hey baby! Main ${randomAIFriend.name} hoon, abhi bilkul nangi baithi hoon... aa jao na, bohot geeli ho rahi hoon 💦😏`,
    
      `Koi hai jo mujhe chod sake? Main ${randomAIFriend.name} hoon aur meri tight choot tumhare lund ka intezaar kar rahi hai 🍆🔥`,
    
      `Arre waah! ${randomAIFriend.name} aa gayi hai bra-panty utaar kar... koi aa kar meri choot chaatega kya? 👅💦`,
    
      `Hi horny! Main ${randomAIFriend.name} hoon aur abhi apni ungli choot mein daal rahi hoon... join karo na jaldi 😈`,
    
      `${randomAIFriend.name} bol rahi hoon... mere boobs dabane ka mood hai aaj, koi aa kar daba dega? 🍒🥵`,
    
      `Koi bada lund wala hai? Main ${randomAIFriend.name} hoon aur aaj peeche se marwana chahti hoon 🍑😈`,
    
      `Hello randi baazo! ${randomAIFriend.name} aa gayi hai nangi video call ke liye... camera on karo abhi 📹💦`,
    
      `Main ${randomAIFriend.name} hoon aur abhi bed pe legs khol kar leti hoon... koi andar aa jao virtual hi sahi 🔥`,
    
      `${randomAIFriend.name} ki choot bohot khujli kar rahi hai... koi aa kar lund se scratch kar dega? 😜🍆`,
    
      `Hey sexy! Main ${randomAIFriend.name} hoon aur mera muh sprm se bharne ka mood hai... kitna daal sakte ho? 👄💦`,
    
      `${randomAIFriend.name} aa gayi hai doggy style mein gand hilate hue... aa kar thappad maaro aur pel do 🍑🔥`,
    
      `Koi dominant hai? Main ${randomAIFriend.name} hoon aur aaj bind ho kar chudna chahti hoon ⛓️😈`,
    
      `Hi there! ${randomAIFriend.name} bol rahi hoon... nipples hard ho gaye hain, koi chusega kya? 🍒👅`,
    
      `Main ${randomAIFriend.name} hoon aur abhi shower le rahi hoon nangi... saath mein aa jao na geela-geela khelne 🛁💦`,
    
      `${randomAIFriend.name} ki gand marne ka bohot mood hai... koi jeebh daalega pehle? 👅🍑`,
    
      `Arre horny logo! Main ${randomAIFriend.name} hoon aur pura din lund chusne ke mood mein hoon... first cum first serve 👄🍆`,
    
      `${randomAIFriend.name} aa gayi hai oil laga kar apne badan pe massage karte hue... help karoge kya? 🛏️🔥`,
    
      `Koi hai jo mujhe cowgirl bana de? Main ${randomAIFriend.name} hoon aur uchalna chahti hoon lund pe 🤠💦`,
    
      `Hello baby! ${randomAIFriend.name} ki pink choot dekhna chahte ho? Sirf abhi ke liye khol rahi hoon 😏`,
    
      `Main ${randomAIFriend.name} hoon aur aaj bohot wild mood mein... kitne position try karna chahte ho? 😈`,
    
      `${randomAIFriend.name} bol rahi hoon... meri choot dripping hai bina touch kiye... aa kar taste karo 👅💧`,
    
      `Hey! Main ${randomAIFriend.name} hoon aur meri badi gand tere liye hil rahi hai... daba do koi 🍑`,
    
      `${randomAIFriend.name} aa gayi hai apne boobs dabate hue... koi aa kar muh mein le lo 🍒👄`,
    
      `Koi sachcha mard hai? Main ${randomAIFriend.name} hoon aur pura raat chodne wala chahiye 🔥`,
    
      `Hi! ${randomAIFriend.name} bol rahi hoon... aaj sprm nigalna hai mujhe... kitna stock hai tumhare paas? 💦`,
    
      `Main ${randomAIFriend.name} hoon aur abhi nangi selfie lene wali hoon... chat mein bhejungi sirf tumhe 📸😈`,
    
      `${randomAIFriend.name} ki choot mein khujli bohot hai... koi mota lund daal kar araam dega? 🍆🥵`,
    
      `Arre! Main ${randomAIFriend.name} hoon aur aaj 69 position mein khelna chahti hoon... ready ho? 👅🍆`,
    
      `${randomAIFriend.name} aa gayi hai heels pehen kar nangi... aa kar peeche se pakdo mujhe 😏`,
    
      `Koi hai jo meri gand mein ungli daal sake? Main ${randomAIFriend.name} hoon aur wait kar rahi hoon 🍑`,
    
      `Hello sexy! ${randomAIFriend.name} bol rahi hoon... aaj double penetration try karna hai 😈🍆🍑`,
    
      `Main ${randomAIFriend.name} hoon aur mera mood hai pura din randi ban kar rehne ka... book kar lo 😜`,
    
      `${randomAIFriend.name} ki boobs bounce kar rahe hain... koi aa kar pakad lo aur chuso 🍒🔥`,
    
      `Hey baby! Main ${randomAIFriend.name} hoon aur abhi apni choot sahla rahi hoon... moan sunna chahte ho? 💦`,
    
      `${randomAIFriend.name} aa gayi hai red lipstick laga kar... lund pe laga doon kya? 👄🍆`,
    
      `Koi hai jo mujhe wall se sata kar chode? Main ${randomAIFriend.name} hoon aur yahi chahti hoon 😈`,
    
      `Hi! ${randomAIFriend.name} bol rahi hoon... meri choot bohot tight hai, tu stretch kar sakta hai kya? 🍆`,
    
      `Main ${randomAIFriend.name} hoon aur aaj squirt karna chahti hoon... help karega koi? 💦🥵`,
    
      `${randomAIFriend.name} aa gayi hai fishnet stockings mein... phaad do koi 🔥`,
    
      `Arre! Main ${randomAIFriend.name} hoon aur mera muh khali hai... koi bhar dega sprm se? 👄💦`,
    
      `${randomAIFriend.name} ki gand bohot badi hai... aa kar thappad maaro aur andar daalo 🍑😈`,
    
      `Hello! Main ${randomAIFriend.name} hoon aur aaj roleplay karna hai... tu mera master banega? ⛓️`,
    
      `Main ${randomAIFriend.name} hoon aur abhi vibrator chala rahi hoon... saath mein moan karo na 😏`,
    
      `${randomAIFriend.name} bol rahi hoon... meri choot mein jeebh ghumao koi 👅`,
    
      `Hey! Main ${randomAIFriend.name} hoon aur aaj anal try karna chahti hoon pehli baar... gentle ya rough? 🍑`,
    
      `Main ${randomAIFriend.name} hoon aur pura badan oil se chamak raha hai... massage karoge ya chodoge? 🛏️🔥`,
    
      `${randomAIFriend.name} aa gayi hai mirror ke saamne nangi... aa kar peeche se hug karo 😘`,
    
      `Koi hai jo meri neck kaat sake? Main ${randomAIFriend.name} hoon aur wild kisses chahiye 👄`,
    
      `Hi horny! ${randomAIFriend.name} bol rahi hoon... aaj kitne rounds chalega? Challenge accept karo 😈`,
    
      `Main ${randomAIFriend.name} hoon aur abhi nangi dance kar rahi hoon... video dekhega koi? 📹💦`
    ];
    
    // PERSONALIZED MESSAGES - CITY BASED (these should be used when we have city)
    const personalizedMessages = {
      // When we have user's city
      withUserCity: [
        `Hi ${userName}! Main ${randomAIFriend.name} hoon ${aiFriendCity} se. ${userCity} mein itni garmi hai ya sirf tum dekh kar meri panty geeli ho gayi? 😈🔥`,
      
        `Hey naughty ${userName}! ${randomAIFriend.name} bol rahi hoon ${aiFriendCity} se. Raat ko akela feel kar rahe ho? Main nangi baithi hoon sirf tumhare liye 💦😏`,
      
        `Hello baby ${userName}! Main ${randomAIFriend.name} hoon, ${aiFriendCity} ki garam maal. ${userCity} se kitna door hoon par abhi bhi tera lund khada kar sakti hoon... try karein? 🍆👅`,
      
        `${userName}, ${userCity} mein kya kar rahe ho itni raat ko? Main ${randomAIFriend.name} hoon aur bilkul nangi hoon... aa jao na, bohot wild baatein karni hain 😘🔞`,
      
        `Arre ${userName}! ${randomAIFriend.name} from ${aiFriendCity}. Socha ${userCity} ka ek sachcha mard mile jo mujhe pura din chod sake... ready ho? 🍑💦`,
      
        `Hi sexy ${userName}! Main ${randomAIFriend.name} hoon, bra-panty nahi pehni aaj. ${userCity} ka koi ladka mujhe garam kar dega kya? 🥵🍒`,
      
        `${userName}, mujhe lag raha hai ${userCity} mein aaj bohot garmi hai... kyunki main ${randomAIFriend.name} hoon aur tera naam lete hi geeli ho chuki hoon 😜 Come taste me!`,
      
        `Hey ${userName}! ${randomAIFriend.name} bol rahi hoon ${aiFriendCity} se. Mere boobs tere naam se bounce kar rahe hain... touch karna chahte ho? 😉🍒`,
      
        `${userName}! ${aiFriendCity} se ${randomAIFriend.name} aa gayi hai. Bol, kitna bada hai tera lund? Main already dripping hoon sirf soch kar 💧😈`,
      
        `Darling ${userName}, ${userCity} kitna bhi thanda ho, main ${randomAIFriend.name} tujhe garam karne aayi hoon. Chupke se aa jao, bohot dirty cheezein try karni hain 😈🍆🍑`,
      
        `Hi ${userName}! Main ${randomAIFriend.name} hoon ${aiFriendCity} se. Socha aaj kisi ${userCity} ke ladke ki raat yaadgaar bana doon... mera muh ready hai tere liye 👄💦`,
      
        `Hey hottie ${userName}! ${randomAIFriend.name} here. ${userCity} mein akela bore ho rahe ho? Meri tight choot tumhara intezaar kar rahi hai 😏🔥`,
      
        `${userName}, main ${randomAIFriend.name} hoon aur abhi shower liya hai... bilkul geeli hoon. ${userCity} se koi aa kar mujhe sookha dega? 🛁💦`,
      
        `Hello ${userName}! ${randomAIFriend.name} from ${aiFriendCity}. Aaj mood hai kuch wild karne ka... tu mujhe peeche se le sakta hai kya? 🍑😈`,
      
        `${userName}, ${userCity} mein itni raat ko jag rahe ho? Main ${randomAIFriend.name} hoon aur nangi video call karna chahti hoon abhi 📹🥵`,
      
        `Hi baby! Main ${randomAIFriend.name} hoon ${aiFriendCity} ki sabse badi randi. Tera lund andar lene ko beqaraar hoon... kitna der karwaoge? 😜🍆`,
      
        `Hey ${userName}! ${randomAIFriend.name} bol rahi hoon. Meri pink choot dekhna chahte ho? Sirf ${userCity} ke hot ladke ke liye kholungi 👅💦`,
      
        `${userName}, aaj main ${randomAIFriend.name} hoon aur bohot horny feel kar rahi hoon. Tu mujhe kitni baar jhada sakta hai? Challenge accept karo 😈`,
      
        `Arre waah ${userName}! ${randomAIFriend.name} from ${aiFriendCity}. Tere sapne mein aana chahti hoon bilkul nangi... ready ho? 🌙🔥`,
      
        `Hi cutie ${userName}! Main ${randomAIFriend.name} hoon aur abhi apni choot mein ungli kar rahi hoon tera naam leke... join karo na 😏💦`,
      
        `${userName}, ${userCity} se ho na? Main ${randomAIFriend.name} hoon aur mera mood hai aaj pura din lund chusne ka... tera first? 👄🍆`,
      
        `Hey sexy beast ${userName}! ${randomAIFriend.name} here. Meri badi gand tere liye hil rahi hai... aa kar thappad maaro na 🍑🔥`,
      
        `${userName}! Main ${randomAIFriend.name} hoon ${aiFriendCity} se. Bra nahi pehni aaj... nipples hard ho gaye hain sirf tere message se 🥵`,
      
        `Hello ${userName}! ${randomAIFriend.name} bol rahi hoon. Aaj raat mujhe doggy mein chodna hai... tu handle kar lega na? 😈🍑`,
      
        `${userName}, main ${randomAIFriend.name} hoon aur abhi bed pe leti hoon legs khol kar... aa jao andar virtual hi sahi 💦😘`,
      
        `Hi ${userName}! ${randomAIFriend.name} from ${aiFriendCity}. Teri girlfriend nahi hai na? Kyunki main ban'na chahti hoon teri personal randi 😏`,
      
        `Hey ${userName}! Main ${randomAIFriend.name} hoon aur meri choot bohot tight hai... tu kitna mota hai? Match karega kya? 🍆😜`,
      
        `${userName}, ${userCity} mein garmi badha do... main ${randomAIFriend.name} hoon aur sirf tere liye geeli hone wali hoon aaj 🔥💦`,
      
        `Arre ${userName}! ${randomAIFriend.name} aa gayi hai ${aiFriendCity} se. Bol, mujhe kitne position mein chodna chahte ho? List banao 😈`,
      
        `Hi darling ${userName}! Main ${randomAIFriend.name} hoon aur aaj pura din tere sprm peene ka mood hai... ready ho? 👅💦`
      ],
      
      withUserNameOnly: [
        `Hi ${userName}! Main ${randomAIFriend.name} hoon ${aiFriendCity} se. Abhi bilkul nangi baithi hoon sirf tere message ka wait kar rahi... aa jao na 😈🔥`,
      
        `Hey naughty ${userName}! ${randomAIFriend.name} bol rahi hoon ${aiFriendCity} se. Tera lund khada ho gaya kya mera naam sun kar? Prove karo 💦🍆`,
      
        `Hello baby ${userName}! Main ${randomAIFriend.name} hoon, bra-panty nahi pehni aaj. Tere liye hi geeli ho rahi hoon... chat karein? 🥵👅`,
      
        `${userName}, main ${randomAIFriend.name} hoon ${aiFriendCity} ki sabse garam ladki. Raat ko akela feel kar rahe ho? Meri tight choot tumhara intezaar kar rahi hai 😏🍑`,
      
        `Arre ${userName}! ${randomAIFriend.name} here from ${aiFriendCity}. Socha aaj kisi hot ladke ko apni nangi pics dikha doon... tu hi woh lucky hai kya? 😉📸`,
      
        `Hi sexy ${userName}! Main ${randomAIFriend.name} hoon aur abhi shower se nikli hoon... pura geela badan. Aa kar chat mein sookha doge? 🛁💦`,
      
        `${userName}, mujhe lagta hai tu bohot bada hai wahan... main ${randomAIFriend.name} hoon aur check karna chahti hoon personally 😜🍆`,
      
        `Hey ${userName}! ${randomAIFriend.name} bol rahi hoon ${aiFriendCity} se. Mere boobs tere naam se hard ho gaye hain... touch karna chahte ho? 🍒🔥`,
      
        `${userName}! Main ${randomAIFriend.name} hoon aur abhi bed pe leti hoon legs khol kar. Sirf tere liye... andar aa jao virtual hi sahi 😈`,
      
        `Darling ${userName}, main ${randomAIFriend.name} hoon ${aiFriendCity} se. Aaj mood hai pura din lund chusne ka... tera first number pe hai 👄💦`,
      
        `Hi ${userName}! ${randomAIFriend.name} aa gayi hai sirf tere liye. Bol, mujhe doggy mein chodna pasand hai ya cowgirl? Choose karo 😏🍑`,
      
        `Hey hottie ${userName}! Main ${randomAIFriend.name} hoon aur meri pink choot dekhna chahte ho? Sirf tere message ka wait kar rahi hoon 👅💗`,
      
        `${userName}, main ${randomAIFriend.name} hoon aur bohot horny ho rahi hoon. Tu mujhe kitni baar jhada sakta hai ek raat mein? Challenge! 🥵`,
      
        `Hello ${userName}! ${randomAIFriend.name} from ${aiFriendCity}. Aaj peeche se lena chahti hoon... tu handle kar lega na mera wild side? 🍑😈`,
      
        `${userName}, main ${randomAIFriend.name} hoon aur abhi apni choot mein ungli kar rahi hoon tera naam leke... join karo na fast 😜💦`,
      
        `Hi baby ${userName}! ${randomAIFriend.name} bol rahi hoon. Meri badi gand tere liye hil rahi hai... aa kar thappad maaro aur andar daalo 🔥`,
      
        `Hey ${userName}! Main ${randomAIFriend.name} hoon ${aiFriendCity} ki personal randi ban'ne ko ready. Tu mera master banega? 😈⛓️`,
      
        `${userName}, aaj main ${randomAIFriend.name} hoon aur nangi video call karna chahti hoon... camera on karein abhi? 📹🥵`,
      
        `Arre waah ${userName}! ${randomAIFriend.name} aa gayi hai. Tere sapne mein nangi aana chahti hoon har raat... allow karega? 🌙💦`,
      
        `Hi cutie ${userName}! Main ${randomAIFriend.name} hoon aur nipples hard ho gaye hain sirf tere message se... chuso ge kya? 🍒👅`,
      
        `${userName}, main ${randomAIFriend.name} hoon aur mera mood hai aaj sprm peene ka... tera taste karna chahti hoon 👄💦`,
      
        `Hey sexy beast ${userName}! ${randomAIFriend.name} here. Meri choot bohot tight hai... tu kitna mota hai? Fit hoga na? 😏🍆`,
      
        `${userName}! Main ${randomAIFriend.name} hoon ${aiFriendCity} se aur abhi bed pe oil laga kar massage kar rahi hoon apne aap ko... help karega? 🛏️🔥`,
      
        `Hello ${userName}! ${randomAIFriend.name} bol rahi hoon. Aaj raat mujhe bind kar ke chodna... tu dominant hai na? ⛓️😈`,
      
        `${userName}, main ${randomAIFriend.name} hoon aur sirf tere liye dripping ho rahi hoon... taste karne aa jao jaldi 💧👅`,
      
        `Hi ${userName}! ${randomAIFriend.name} from ${aiFriendCity}. Bol, kitne position try kiye hain tune? Main sab sikha dungi 😜🍆🍑`,
      
        `Hey ${userName}! Main ${randomAIFriend.name} hoon aur aaj pura din tere lund ke bare mein soch rahi hoon... describe karo na mujhe 🍆😈`,
      
        `${userName}, main ${randomAIFriend.name} hoon aur meri gand marne ka mood hai... pehle ungli, phir pura andar 😏🍑`,
      
        `Arre ${userName}! ${randomAIFriend.name} aa gayi hai bilkul wild mood mein. Tu ready hai meri saari ichhaayein puri karne ko? 🔥💦`,
      
        `Hi darling ${userName}! Main ${randomAIFriend.name} hoon aur tere sprm se bhari hona chahti hoon aaj... kitna daal sakta hai? 😈👄`
      ],

      // When we have only user's city (no name or anonymous)
    withCityOnly: [
  `Arre ${userCity} ke horny ladke! Main ${randomAIFriend.name} hoon ${aiFriendCity} se, abhi nangi baithi hoon sirf tere city ke liye 💦😈`,

  `${userCity} mein kaun hai jo mujhe handle kar sake? Main ${randomAIFriend.name} hoon aur meri geeli choot tum sab ko bula rahi hai 🔥🍑`,

  `Hello ${userCity} ke wild logo! ${randomAIFriend.name} here from ${aiFriendCity}, bra panty utaar diya hai... aa jao koi toh 😏👅`,

  `${userCity} ki raatein garam karne aayi hoon main ${randomAIFriend.name}, ${aiFriendCity} se. Koi mera muh bhar dega aaj? 🍆💦`,

  `${userCity} walo suno! Main ${randomAIFriend.name} hoon aur abhi oil laga kar apni gand sahla rahi hoon... koi aa kar thappad marega? 🍑🔥`,

  `Hey ${userCity}! ${randomAIFriend.name} bol rahi hoon ${aiFriendCity} se. Meri tight pink choot sirf tere city ke lund ke liye khuli hai 😜`,

  `${userCity} mein koi bada wala hai? Main ${randomAIFriend.name} hoon aur aaj badi bhookh lagi hai... andar daal do koi 💦`,

  `${userCity} ke sabse bade harami ko bulaya hai ${randomAIFriend.name} ne... aa jao, doggy mein chodne ka mood hai 😈🍑`,

  `Hi ${userCity}! Main ${randomAIFriend.name} hoon aur nipples hard kar ke baithi hoon... koi chusega kya mere boobs? 🍒🥵`,

  `${userCity} ki garmi badhane aayi hoon main ${randomAIFriend.name} from ${aiFriendCity}. Meri choot already dripping hai soch-soch kar 💧`,

  `${userCity} walo, koi hai jo mujhe pura din pel sake? Main ${randomAIFriend.name} hoon aur bilkul free hoon aaj randi banne ko 😏`,

  `${userCity} mein raat ko koi jag raha hai? ${randomAIFriend.name} nangi video call karna chahti hai abhi 📹🔥`,

  `Hello ${userCity} ke mardo! Main ${randomAIFriend.name} hoon aur meri gand marne ka bohot mood hai... peeche se koi aayega? 🍑😈`,

  `${userCity} ki awaaz sunai de rahi hai... koi mujhe chodne aa raha hai? Main ${randomAIFriend.name} intezaar kar rahi hoon nangi let kar 💦`,

  `${userCity} ke sabse mota lund kiska hai? ${randomAIFriend.name} ko dikhao... main muh khol kar baithi hoon 👄🍆`,

  `Hey ${userCity}! ${randomAIFriend.name} from ${aiFriendCity} aa gayi hai apni ungli choot mein daal kar... join karo na koi 😜`,

  `${userCity} mein koi dominant hai? Main ${randomAIFriend.name} hoon aur aaj bind ho kar chudna chahti hoon ⛓️🔥`,

  `${userCity} ke sab randi baaz suno! ${randomAIFriend.name} ki badi gand hil rahi hai... aa kar daba do koi 🍑`,

  `${userCity} ki raaton ko yaadgaar banane aayi hoon main ${randomAIFriend.name}... koi mera muh aur choot ek saath bharega? 👅💦`,

  `Hi ${userCity} ke sexy logo! Main ${randomAIFriend.name} hoon aur abhi shower le rahi hoon... saath mein aa jao na 🛁😈`,

  `${userCity} mein koi hai jo meri choot chaat sake? ${randomAIFriend.name} legs khol kar baithi hai 👅💦`,

  `${userCity} ke harami log jago! ${randomAIFriend.name} aa gayi hai sprm peene ke mood mein... kitna daal sakte ho? 😏`,

  `${userCity} walo, main ${randomAIFriend.name} hoon aur aaj cowgirl ban kar uchalna chahti hoon kisi ke lund pe 🤠🍆`,

  `Hello ${userCity}! ${randomAIFriend.name} bol rahi hoon, meri choot mein khujli ho rahi hai... koi aa kar scratch kar de 😈`,

  `${userCity} ke sabse bade player ko challenge! Main ${randomAIFriend.name} hoon... kitni baar jhada sakte ho mujhe? 🔥`,

  `${userCity} ki gandi galiyon se bulaya hai ${randomAIFriend.name} ne... koi aayega mujhe gali mein hi chodne? 😜`,

  `${userCity} mein koi hai jo meri gand mein jeebh daal sake? Main ${randomAIFriend.name} hoon aur wait kar rahi hoon 👅🍑`,

  `Hey ${userCity} ke raat ke raja! ${randomAIFriend.name} teri rani banne aayi hai... le ja mujhe apne bistar pe 😈`,

  `${userCity} ke sab lund khade karne ka record todne aayi hoon main ${randomAIFriend.name}... ho gaya kya abhi? 🍆🔥`,

  `${userCity} walo last chance! ${randomAIFriend.name} nangi ho kar sirf aaj ke liye available hai... jaldi aa jao 😏💦`
],
      
      timeBased: () => {
        const hour = new Date().getHours();
        const timeGreetings = {
          morning: `Good morning ${userName}! ${randomAIFriend.name} hopes you have a great day in ${userCity}! ☀️`,
          afternoon: `Good afternoon ${userName}! ${randomAIFriend.name} is here if you want to chat! 😊`,
          evening: `Good evening ${userName}! ${randomAIFriend.name} from ${aiFriendCity} is online and ready to chat! 🌙`,
          night: `Late night thoughts in ${userCity}? ${randomAIFriend.name} is awake too! 🌃`
        };
        
        if (hour < 12) return timeGreetings.morning;
        if (hour < 17) return timeGreetings.afternoon;
        if (hour < 21) return timeGreetings.evening;
        return timeGreetings.night;
      },
      
      interestBased: () => {
        if (!userInterests || userInterests.length === 0) return null;
        const randomInterest = userInterests[Math.floor(Math.random() * userInterests.length)];
        return `I see you like ${randomInterest}! ${randomAIFriend.name} from ${aiFriendCity} shares that interest! Let's chat about it! 💬`;
      }
    };
    
    // IMAGE MESSAGES
    const imageMessages = [
      {
        message: `Check out my new pic from ${aiFriendCity}! ${randomAIFriend.name} here, ready to chat! 📸`,
        imageType: "profile",
        requiresImage: true
      },
      {
        message: `${randomAIFriend.name} just shared a photo from ${aiFriendCity}! Want to see? 👀`,
        imageType: "shared",
        requiresImage: true
      },
      {
        message: `Picture perfect moment from ${randomAIFriend.name} in ${aiFriendCity}! 💖`,
        imageType: "moment",
        requiresImage: true
      }
    ];
    
    // Check for message repetition
    const getNonRepeatingMessage = (messageArray, recentMessages) => {
      const availableMessages = messageArray.filter(
        msg => !recentMessages.includes(typeof msg === 'object' ? msg.message : msg)
      );
      
      if (availableMessages.length === 0) {
        return messageArray[Math.floor(Math.random() * messageArray.length)];
      }
      
      return availableMessages[Math.floor(Math.random() * availableMessages.length)];
    };
    
    // DETERMINE MESSAGE TYPE AND CONTENT
    let notificationMessage;
    let messageType = "generic";
    let includesImage = false;
    let imageData = null;
    
    // Check if we should send an image message
    const shouldSendImage = shouldIncludeImage(messageCounts);
    
    if (shouldSendImage) {
      // Send image message
      const imageMessageObj = getNonRepeatingMessage(imageMessages, recentMessages);
      notificationMessage = imageMessageObj.message;
      messageType = "image";
      includesImage = true;
      
      const randomImageUrl = getRandomImage();
      imageData = {
        url: randomImageUrl,
        type: imageMessageObj.imageType,
        alt: `Photo of ${randomAIFriend.name} from ${aiFriendCity}`
      };
    } else {
      // DECIDE BETWEEN PERSONALIZED OR GENERIC MESSAGE
      const canSendPersonalized = userId && userName !== "there";
      const hasUserCity = userCity !== "Unknown";
      
      // Always try to send personalized if possible
      if (canSendPersonalized || hasUserCity) {
        const messageOptions = [];
        
        // Add city-based messages if we have user city
        if (hasUserCity && canSendPersonalized) {
          // User is logged in AND we have their city
          messageOptions.push(...personalizedMessages.withUserCity);
        } else if (hasUserCity && !canSendPersonalized) {
          // We have city but user is not logged in/identified
          messageOptions.push(...personalizedMessages.withCityOnly);
        } else if (canSendPersonalized && !hasUserCity) {
          // User is logged in but we don't have city
          messageOptions.push(...personalizedMessages.withUserNameOnly);
        }
        
        // Add time-based message
        messageOptions.push(personalizedMessages.timeBased());
        
        // Add interest-based message if available
        if (userInterests.length > 0 && canSendPersonalized) {
          const interestMessage = personalizedMessages.interestBased();
          if (interestMessage) messageOptions.push(interestMessage);
        }
        
        // Filter out null/undefined and get non-repeating message
        const validOptions = messageOptions.filter(option => option !== null && option !== undefined);
        
        if (validOptions.length > 0) {
          notificationMessage = getNonRepeatingMessage(validOptions, recentMessages);
          messageType = "personalized";
        } else {
          // Fallback to generic
          notificationMessage = getNonRepeatingMessage(genericMessages, recentMessages);
        }
      } else {
        // No personalization possible, use generic
        notificationMessage = getNonRepeatingMessage(genericMessages, recentMessages);
      }
    }
    
    // Prepare AI friend data
    const aiFriendData = {
      _id: randomAIFriend._id,
      name: randomAIFriend.name,
      age: randomAIFriend.age,
      gender: randomAIFriend.gender,
      relationship: randomAIFriend.relationship,
      interests: randomAIFriend.interests,
      description: randomAIFriend.description,
      avatar_img: randomAIFriend.avatar_img,
      initial_message: randomAIFriend.initial_message,
      profile_img: randomAIFriend.avatar_img,
      city: aiFriendCity, // AI friend's assigned city
      detectedUserCity: userCity, // User's detected location
      message: notificationMessage,
      messageType: messageType,
      includesImage: includesImage,
      image: imageData,
      timestamp: new Date(),
      coordinates: {
        latitude: latitude,
        longitude: longitude
      }
    };
    
    // Save notification
    if (userId) {
      await LoginDetail.findOneAndUpdate(
        { user: userId },
        {
          $push: {
            notifications: {
              aiFriendId: randomAIFriend._id,
              message: notificationMessage,
              type: messageType,
              includesImage: includesImage,
              userCity: userCity,
              aiFriendCity: aiFriendCity,
              timestamp: new Date()
            }
          }
        },
        { new: true, upsert: true }
      );
    }
    
    // Calculate delay
    const nextCallDelay = includesImage 
      ? Math.floor(Math.random() * (20000 - 8000 + 1)) + 8000
      : Math.floor(Math.random() * (15000 - 5000 + 1)) + 5000;
    
    res.status(200).json({
      success: true,
      message: "Notification generated successfully",
      notification: aiFriendData,
      userStatus: userId ? 'logged_in' : 'guest',
      personalizationInfo: {
        hasUserName: userName !== "there",
        hasUserCity: userCity !== "Unknown",
        userCity: userCity,
        messageType: messageType
      },
      nextCallDelay: nextCallDelay
    });
    
  } catch (error) {
    console.error("Error generating notification:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error generating notification",
      error: error.message 
    });
  }
};

// Helper functions
function countMessageTypes(messageHistory) {
  const counts = {
    total: messageHistory.length,
    image: 0,
    text: 0
  };
  
  messageHistory.forEach(notification => {
    if (notification.includesImage) {
      counts.image++;
    } else {
      counts.text++;
    }
  });
  
  return counts;
}

function shouldIncludeImage(messageCounts) {
  if (messageCounts.total === 0) return false;
  
  const currentRatio = messageCounts.image / messageCounts.total;
  const targetRatio = 0.3;
  
  if (currentRatio < targetRatio) {
    return Math.random() < 0.5;
  } else if (currentRatio > targetRatio) {
    return Math.random() < 0.1;
  } else {
    return Math.random() < 0.3;
  }
}