const mongoose = require("mongoose");

const User = require("../models/User");
const AIFriend = require("../models/AIFriend");
const Chat = require("../models/Chat");
const LoginDetail = require("../models/LoginDetail");
const moment = require("moment");  // Add this line if using Moment.js
const Ticket = require("../models/Ticket");
const nodemailer = require("nodemailer");

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
            res.json({ status: true });
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

    // Fetch AI friends using their IDs
    const friends = await AIFriend.find({ _id: { $in: userData.ai_friends } });

    // Fetch the last AI-sent message for each AI friend
    const chatDetails = await Promise.all(
      friends.map(async (friend) => {
        const lastMessageData = await Chat.findOne({
          participants: userId // Make sure user is in the chat
        })
          .sort({ "messages.time": -1 }) // Get the latest message
          .select("messages") // Select only messages
          .lean();
        
        const lastAIMsg = lastMessageData?.messages
          .filter((msg) => msg.senderModel === "AIFriend")
          .pop(); // Get last AI message

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

    const AiModelData = await AIFriend.findById(chatId);
    res.status(200).json({ chat,  AiModelData });
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
