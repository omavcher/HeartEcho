const User = require("../models/User")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const sendEmail = require("../config/emailSender");

exports.registerUser = async (req, res) => {
  try {
    const { fullName, email, phone, password, gender, birth_date, interests, user_type ,twoFA ,profilePicture ,referralCode , subscribeNews ,termsAccepted , age , selectedInterests} = req.body;

    // 1️⃣ Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // 2️⃣ Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const formattedInterests = Array.isArray(selectedInterests) ? selectedInterests : [];

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

    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      message: "User registered successfully!",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        user_type: newUser.user_type,
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
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    // 4️⃣ Send response (excluding sensitive data)
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        user_type: user.user_type,
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
    if (!user) return res.status(400).json({ message: "User not found. Please sign up first." });

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({ token, user });
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
        await sendEmail(email, `Your OTP Code: ${otp}`);

        res.json({ success: true, message: "OTP sent successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to send OTP" });
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

