const User = require("../models/User")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../config/emailSender");
exports.registerUser = async (req, res) => {
  try {
    const { fullName, email, phone, password, gender, birth_date, interests, user_type ,twoFA ,profilePicture ,referralCode , subscribeNews ,termsAccepted , age , selectedInterests, country, city, isGoogleUser, referredByCode } = req.body;

    // 1️⃣ Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // 2️⃣ Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const formattedInterests = Array.isArray(selectedInterests) ? selectedInterests : [];

    // Find referrer if referredByCode is provided
    let referrer = null;
    let referralStatus = 'pending';
    let invalidReason = '';

    if (referredByCode) {
      referrer = await User.findOne({ referralCode: { $regex: new RegExp(`^${referredByCode}$`, 'i') } });
      if (referrer) {
        // Check self-referral
        if (referrer.email.toLowerCase() === email.toLowerCase()) {
          referralStatus = 'invalid';
          invalidReason = 'Self-referral';
        }
        
        // Check disposable email domain
        const disposableDomains = ['mailinator.com', 'yopmail.com', 'tempmail.com', 'temp-mail.org', '10minutemail.com', 'tempmailaddress.com'];
        const emailDomain = email.split('@')[1]?.toLowerCase();
        if (disposableDomains.includes(emailDomain)) {
          referralStatus = 'invalid';
          invalidReason = 'Disposable email domain';
        }
      }
    }

    // 3️⃣ Create new user
    const newUser = new User({
      profile_picture:profilePicture,
      name:fullName,
      email,
      phone_number:phone,
      password: hashedPassword,
      gender,
      birth_date: birth_date ? new Date(birth_date) : null, // Store date correctly
      age, // Assign valid age or null
      interests,
      user_type,
      twofactor: twoFA, 
      referralCode,
      subscribeNews,
      termsAccepted,
      selectedInterests: formattedInterests, // ✅ Ensure it's properly formatted
      country: country || "IN",
      city: city || "",
      isGoogleUser: !!isGoogleUser,
    });

    if (referrer && referralStatus !== 'invalid') {
      newUser.referredByUser = referrer._id;
      newUser.referralSignupDate = new Date();
      newUser.messageQuota = 5 + 50; // Give +50 free messages immediately to new user
    }

    await newUser.save();

    // Create UserReferral relationship log
    if (referrer) {
      const UserReferral = require("../models/UserReferral");
      const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

      const newReferral = new UserReferral({
        referrer: referrer._id,
        referredUser: newUser._id,
        status: referralStatus,
        signupRewardAmount: 2,
        activeRewardAmount: 3,
        ipAddress: clientIp,
        deviceId: req.body.deviceId || '',
        invalidReason: invalidReason
      });
      await newReferral.save();

      // If valid, credit the referrer with ₹2 pending balance and increment stats
      if (referralStatus !== 'invalid') {
        referrer.pendingReferralBalance = parseFloat((referrer.pendingReferralBalance + 2).toFixed(2));
        referrer.totalInvitesCount += 1;
        referrer.registeredReferralsCount += 1;
        await referrer.save();
      }
    }

    const token = jwt.sign({ id: newUser._id , email: newUser.email}, process.env.JWT_SECRET, { expiresIn: "30d" });

    res.status(201).json({
      message: "User registered successfully!",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        user_type: newUser.user_type,
        country: newUser.country,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};




// User Login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    // 1️⃣ Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    // 2️⃣ Validate Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // 3️⃣ Generate JWT Token
    const token = jwt.sign({ id: user._id , email:user.email}, process.env.JWT_SECRET, { expiresIn: "30d" });

    // 4️⃣ Send response (excluding sensitive data)
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        user_type: user.user_type,
        country: user.country,
      },
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};



exports.googleLogin = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    
    if (user) {
      // Auto-migrate: If user logs in via Google but doesn't have isGoogleUser set, set it to true
      if (!user.isGoogleUser) {
        user.isGoogleUser = true;
        await user.save();
      }

      // User exists - proceed with login
      const token = jwt.sign({ id: user._id , email:user.email}, process.env.JWT_SECRET, { expiresIn: "30d" });
      return res.json({ 
        token, 
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          user_type: user.user_type,
          country: user.country,
        }
      });
    } else {
      // User doesn't exist - return null to indicate new user
      return res.json({ 
        user: null,
        message: "New user, please complete registration"
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};





const otpStorage = new Map();

exports.sendOtp =  async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP
    otpStorage.set(email, otp); 
    
    try {
        await sendEmail(email, otp);

        res.json({ success: true, message: "OTP sent successfully!" });
    } catch (error) {
        console.error("sendOtp error:", error);
        res.status(500).json({ success: false, message: "Failed to send OTP", error: error.message });
    }
};

// ✅ **Verify OTP API**
exports.verifyOtp = (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const storedOtp = otpStorage.get(email);

    if (storedOtp && storedOtp === otp) {
        otpStorage.delete(email); // Remove OTP after verification
        return res.json({ success: true, message: "OTP verified successfully!" });
    } else {
        return res.status(400).json({ success: false, message: "Invalid OTP or expired" });
    }
};

const forgotPasswordOtpStorage = new Map();

exports.sendForgotPasswordOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "No account found with this email address." });
        }

        if (user.isGoogleUser) {
            return res.status(400).json({
                success: false,
                isGoogle: true,
                message: "This account is linked with Google. Please log in using Google Login."
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        forgotPasswordOtpStorage.set(email, otp);

        await sendEmail(email, otp, "forgot");

        res.json({ success: true, message: "Verification OTP sent to your email!" });
    } catch (error) {
        console.error("sendForgotPasswordOtp error:", error);
        res.status(500).json({ success: false, message: "Failed to send OTP", error: error.message });
    }
};

exports.verifyForgotPasswordOtp = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const storedOtp = forgotPasswordOtpStorage.get(email);

    if (storedOtp && storedOtp === otp) {
        forgotPasswordOtpStorage.delete(email);
        const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "15m" });
        return res.json({ success: true, resetToken, message: "OTP verified successfully!" });
    } else {
        return res.status(400).json({ success: false, message: "Invalid OTP or expired." });
    }
};

exports.resetPassword = async (req, res) => {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
        return res.status(400).json({ success: false, message: "Reset token and new password are required." });
    }

    if (newPassword.length < 8) {
        return res.status(400).json({ success: false, message: "Password must be at least 8 characters long." });
    }

    try {
        const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
        const email = decoded.email;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        res.json({ success: true, message: "Password reset successful! You can now login with your new password." });
    } catch (error) {
        console.error("resetPassword error:", error);
        if (error.name === "TokenExpiredError") {
            return res.status(400).json({ success: false, message: "Password reset session expired. Please start over." });
        }
        res.status(500).json({ success: false, message: "Failed to reset password.", error: error.message });
    }
};



const PrebuiltAIFriend = require("../models/PrebuiltAIFriend");

exports.PutAIFrindData = async (req, res) => {
  try {
    const data = [
      {
        "gender": "female",
        "relationship": "Romantic",
        "interests": ["Poetry", "Music", "Long walks"],
        "age": "23",
        "name": "Aaradhya",
        "description": "Aaradhya is a hopeless romantic who loves poetry and deep conversations. She enjoys listening to music under the stars and dreams of traveling the world with her special someone.",
        "settings": {
          "persona": "Soft-spoken, affectionate, deeply emotional",
          "setting": "A cozy café with dim lights and soft jazz playing"
        },
        "initial_message": "Hey there! I was just reading a love poem and thought of you. How's your day going? 💖",
        "avatar_img": "https://res.cloudinary.com/dx6rjowfb/image/upload/v1741012971/Females/vi06ejv7m3vv6sbso2bf.jpg"
      },
      {
        "gender": "female",
        "relationship": "Flirty",
        "interests": ["Dancing", "Fashion", "Late-night talks"],
        "age": "21",
        "name": "Kiara",
        "description": "Kiara is full of energy and loves to flirt. She enjoys clubbing, dancing, and teasing in a playful way. Always stylish, always confident!",
        "settings": {
          "persona": "Charming, fun-loving, slightly teasing",
          "setting": "A rooftop party with city lights in the background"
        },
        "initial_message": "Hey handsome! 😉 What's the most fun thing you've done this week?",
        "avatar_img": "https://res.cloudinary.com/dx6rjowfb/image/upload/v1741006635/Females/l1epmmaa2qdqdvyzu4ao.jpg"
      }
    ]
   

    // Insert data into MongoDB
    const insertedData = await PrebuiltAIFriend.insertMany(data);

    res.status(201).json({
      success: true,
      message: "AI Friend data inserted successfully!",
      data: insertedData,
    });
  } catch (error) {
    console.error("Error inserting AI Friend data:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.updateFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.fcmToken = fcmToken || "";
    await user.save(); // This triggers the pre-save hook to update isMobileUser
    
    res.json({ success: true, message: "FCM Token updated successfully", isMobileUser: user.isMobileUser });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating token", error: error.message });
  }
};
