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
    const userId = req.user.id;

    // Fetch user data
    const userData = await User.findById(userId);
    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch AI Friends from both AIFriend and PrebuiltAIFriend collections
    const aiFriends = await AIFriend.find({ _id: { $in: userData.ai_friends } });
    const prebuiltAIFriends = await PrebuiltAIFriend.find({ _id: { $in: userData.ai_friends } });

    // Combine both AI friend lists
    const allFriends = [...aiFriends, ...prebuiltAIFriends];

    // Fetch the last AI-sent message for each AI friend
    const chatDetails = await Promise.all(
      allFriends.map(async (friend) => {
        const lastMessageData = await Chat.findOne({
          participants: userId, // Ensure user is in the chat
          "messages.sender": friend._id, // Ensure messages from this AI friend
        })
          .sort({ "messages.time": -1 }) // Get the latest message
          .select("messages") // Select only messages
          .lean();
        
        // Get last message from either AIFriend or PrebuiltAIFriend
        const lastAIMsg = lastMessageData?.messages
          .filter((msg) => msg.senderModel === "AIFriend" || msg.senderModel === "PrebuiltAIFriend")
          .pop();

        return {
          _id: friend._id,
          name: friend.name,
          avatar: friend.avatar_img,
          lastMessage: lastAIMsg ? lastAIMsg.text : "No messages yet",
          lastMessageTime: lastAIMsg ? lastAIMsg.time : null,
        };
      })
    );

    res.status(200).json(chatDetails);
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
        (await PrebuiltAIFriend.findById(chatId)) ||
        (await AIFriend.findById(chatId));

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

    if (rupees === 29) {
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
