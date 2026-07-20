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
const DeletedAccount = require("../models/DeletedAccount");
const ReferralCreator = require("../models/ReferralCreator");
const { getCityFromCoordinates } = require("../utils/geocoding");
const jwt = require("jsonwebtoken");
const aiController = require("./aiController");

const determinePlatform = (req) => {
  if (req.body && (req.body.platform === "web" || req.body.platform === "mobile")) {
    return req.body.platform;
  }
  if (req.headers && (req.headers["x-platform"] === "web" || req.headers["x-platform"] === "mobile")) {
    return req.headers["x-platform"];
  }
  const ua = (req.headers && req.headers["user-agent"]) || "";
  const uaLower = ua.toLowerCase();
  if (
    uaLower.includes("okhttp") ||
    uaLower.includes("dart") ||
    uaLower.includes("retrofit") ||
    uaLower.includes("heartecho-app") ||
    uaLower.includes("heartecho_app") ||
    uaLower.includes("flutter") ||
    uaLower.includes("react-native")
  ) {
    return "mobile";
  }
  return "web";
};

require("dotenv").config();

const INDIAN_STATES_CITIES = {
  "andhra pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Rajahmundry", "Tirupati", "Kadapa", "Kakinada", "Anantapur", "Eluru", "Vizianagaram", "Ongole", "Nandyal", "Machilipatnam", "Adoni", "Tenali", "Chittoor", "Hindupur", "Proddatur", "Bhimavaram", "Madanapalle", "Guntakal", "Dharmavaram", "Gudivada", "Srikakulam", "Narasaraopet", "Tadipatri", "Tadepalligudem", "Chilakaluripet"],
  "arunachal pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Namsai", "Tawang", "Ziro", "Bomdila", "Tezu", "Aalo", "Khonsa", "Roing", "Changlang", "Basar", "Dirang"],
  "assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur", "Bongaigaon", "Karimganj", "Sivasagar", "Barpeta", "Dhubri", "Goalpara", "North Lakhimpur", "Diphu", "Golaghat", "Lanka", "Mangaldai", "Mariani", "Kokrajhar"],
  "bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Bihar Sharif", "Darbhanga", "Purnia", "Arrah", "Begusarai", "Katihar", "Munger", "Chapra", "Danapur", "Saharsa", "Sasaram", "Hajipur", "Dehri", "Bettiah", "Motihari", "Siwan", "Kishanganj", "Jamalpur", "Buxar", "Jehanabad", "Aurangabad", "Lakhisarai", "Nawada", "Gopalganj", "Supaul", "Samastipur"],
  "chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Rajnandgaon", "Jagdalpur", "Ambikapur", "Dhamtari", "Raigarh", "Mahasamund", "Champa", "Bhatapara", "Durg", "Dalli-Rajhara", "Naila Janjgir", "Tilda Newra", "Mungeli", "Manendragarh", "Sakti", "Bailadila"],
  "goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda", "Bicholim", "Curchorem", "Valpoi", "Pernem", "Canacona"],
  "gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar", "Junagadh", "Gandhidham", "Anand", "Navsari", "Morbi", "Nadiad", "Surendranagar", "Bharuch", "Mehsana", "Bhuj", "Porbandar", "Palanpur", "Valsad", "Vapi", "Gondal", "Veraval", "Godhra", "Patan", "Kalol", "Dahod", "Botad", "Amreli", "Deesa"],
  "haryana": ["Faridabad", "Gurugram", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Karnal", "Sonipat", "Panchkula", "Sirsa", "Bahadurgarh", "Jind", "Thanesar", "Kaithal", "Rewari", "Palwal", "Hansi", "Narnaul", "Fatehabad"],
  "himachal pradesh": ["Shimla", "Dharamshala", "Solan", "Mandi", "Nahan", "Baddi", "Una", "Hamirpur", "Paonta Sahib", "Kullu", "Chamba", "Bilaspur", "Kangra", "Palampur", "Sundarnagar"],
  "jammu & kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Kathua", "Sopore", "Udhampur", "Poonch", "Rajouri", "Kupwara", "Kargil", "Leh", "Pulwama", "Samba", "Budgam"],
  "jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro Steel City", "Deoghar", "Phusro", "Hazaribagh", "Giridih", "Ramgarh", "Medininagar", "Chirkunda", "Jhumri Telaiya", "Sahibganj", "Chaibasa", "Dumka", "Gumia", "Ghatshila", "Glow", "Chatra", "Gudri"],
  "karnataka": ["Bengaluru", "Mysuru", "Hubballi-Dharwad", "Mangaluru", "Belagavi", "Davangere", "Ballari", "Vijayapura", "Shivamogga", "Tumakuru", "Raichur", "Bidar", "Hosapete", "Hassan", "Gadag-Betageri", "Udupi", "Chikkamagaluru", "Kolar", "Mandya", "Bagalkot", "Ranibennur", "Gangavati", "Gokak", "Sirsi", "Karwar", "Chitradurga", "Koppal", "Ramanagara", "Chikkaballapur", "Yadgir"],
  "kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Kollam", "Thrissur", "Alappuzha", "Palakkad", "Kannur", "Kottayam", "Kasaragod", "Malappuram", "Pathanamthitta", "Manjeri", "Thalassery", "Ponnani", "Vatakara", "Kanhangad", "Payyanur", "Koyilandy", "Neyyattinkara"],
  "ladakh": ["Leh", "Kargil", "Diskit", "Padum", "Nyoma", "Drass"],
  "madhya pradesh": ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam", "Rewa", "Katni", "Singrauli", "Chhindwara", "Khandwa", "Morena", "Bhind", "Guna", "Shivpuri", "Vidisha", "Chhatarpur", "Damoh", "Mandsaur", "Khargone", "Neemuch", "Pithampur", "Hoshangabad", "Itarsi", "Sehore", "Betul", "Seoni"],
  "maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Kalyan-Dombivli", "Vasai-Virar", "Aurangabad", "Navi Mumbai", "Solapur", "Mira-Bhayandar", "Bhiwandi", "Amravati", "Nanded", "Kolhapur", "Sangli", "Jalgaon", "Akola", "Latur", "Dhule", "Ahmednagar", "Chandrapur", "Parbhani", "Ichalkaranji", "Jalna", "Ambarnath", "Panvel", "Bhusawal", "Ratnagiri", "Beed"],
  "manipur": ["Imphal", "Thoubal", "Kakching", "Lilong", "Mayang Imphal", "Senapati", "Ukhrul", "Churachandpur", "Tamenglong", "Jiribam"],
  "meghalaya": ["Shillong", "Tura", "Jowai", "Nongpoh", "Williamnagar", "Cherrapunji", "Baghmara", "Resubelpara", "Mairang", "Nongstoin"],
  "mizoram": ["Aizawl", "Lunglei", "Saiha", "Champhai", "Kolasib", "Serchhip", "Mamit", "Lawngtlai"],
  "nagaland": ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha", "Zunheboto", "Mon", "Phek", "Kiphire", "Longleng"],
  "odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Brahmapur", "Sambalpur", "Puri", "Balasore", "Bhadrak", "Baripada", "Jharsuguda", "Jeypore", "Bargarh", "Rayagada", "Semiliguda", "Balangir", "Dhenkanal", "Barbil", "Kendujhar", "Paradip", "Jajpur"],
  "puducherry": ["Puducherry", "Karaikal", "Mahe", "Yanam", "Ozhukarai"],
  "punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Hoshiarpur", "Pathankot", "Moga", "Abohar", "Phagwara", "Khanna", "Muktsar", "Barnala", "Firozpur", "Kapurthala", "Rajpura", "Zirakpur", "Malerkotla", "Batala"],
  "rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner", "Ajmer", "Bhilwara", "Alwar", "Sikar", "Bharatpur", "Pali", "Sri Ganganagar", "Barmer", "Hanumangarh", "Tonk", "Beawar", "Kishangarh", "Jhunjhunu", "Churu", "Gangapur City", "Hindaun", "Sawai Madhopur", "Chittorgarh", "Bara", "Jaisalmer", "Narnaul", "Nagaur", "Sujangarh", "Makrana", "Fatehpur"],
  "sikkim": ["Gangtok", "Namchi", "Geyzing", "Mangan", "Singtam", "Rangpo", "Jorethang"],
  "tamil nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tiruppur", "Erode", "Vellore", "Thoothukudi", "Nagercoil", "Thanjavur", "Dindigul", "Kanchipuram", "Karur", "Tirunelveli", "Cuddalore", "Kumbakonam", "Tiruvannamalai", "Pollachi", "Rajapalayam", "Gudiyatham", "Pudukkottai", "Vaniyambadi", "Ambur", "Nagapattinam", "Udhagamandalam", "Hosur", "Karaikudi", "Neyveli"],
  "telangana": ["Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar", "Ramagundam", "Mahbubnagar", "Nalgonda", "Adilabad", "Suryapet", "Miryalaguda", "Siddipet", "Jagtial", "Mancherial", "Kothagudem", "Bodhan", "Siricilla", "Kamareddy", "Kagaznagar", "Wanaparthy", "Gadwal", "Bhongir", "Medak", "Sangareddy", "Vikarabad", "Tandur", "Nirmal", "Bellampally", "Mandamarri", "Bhadrachalam"],
  "tripura": ["Agartala", "Dharmanagar", "Udaipur", "Kailasahar", "Belonia", "Khowai", "Ambassa", "Ranirbazar", "Sabroom"],
  "uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rudrapur", "Kashipur", "Rishikesh", "Nainital", "Pithoragarh", "Almora", "Mussoorie", "Tehri", "Bageshwar", "Ramnagar"],
  "uttar pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Meerut", "Varanasi", "Prayagraj", "Bareilly", "Aligarh", "Moradabad", "Saharanpur", "Gorakhpur", "Noida", "Firozabad", "Jhansi", "Muzaffarnagar", "Mathura", "Ayodhya", "Rampur", "Shahjahanpur", "Farrukhabad", "Hapur", "Mirzapur", "Maunath Bhanjan", "Loni", "Bulandshahr", "Rae Bareli", "Orai", "Bahraich", "Jaunpur"],
  "west bengal": ["Kolkata", "Howrah", "Darjeeling", "Siliguri", "Asansol", "Durgapur", "Maheshtala", "Rajpur Sonarpur", "Gopalpur", "Bhatpara", "Panihati", "Kamarhati", "Bardhaman", "Kulti", "Bally", "Barasat", "Uluberia", "Naihati", "Kharagpur", "English Bazar", "Haldia", "Madhyamgram", "Habra", "Jalpaiguri", "Chinsurah", "Raniganj", "Serampore", "Midnapore", "Alipurduar", "Cooch Behar"],
  "chandigarh": ["Chandigarh", "Manimajra"],
  "delhi": ["New Delhi", "Noida", "Gurugram", "Ghaziabad", "Faridabad", "Dwarka", "Rohini", "Saket", "Vasant Kunj", "Karol Bagh", "Connaught Place", "South Ext", "Lajpat Nagar", "Rajouri Garden", "Punjabi Bagh", "Mayur Vihar", "Janakpuri", "Pitampura", "Chanakyapuri", "Greater Kailash", "Okhla", "Shahdara", "Patparganj", "Model Town", "Shalini Bagh", "Palam", "Vasant Vihar", "R.K. Puram", "Defence Colony", "South Delhi"],
  "dadra and nagar haveli and daman and diu": ["Daman", "Diu", "Silvassa", "Amli", "Dadra"],
  "lakshadweep": ["Kavaratti", "Agatti", "Minicoy", "Amini", "Kalpeni", "Andrott"],
  "andaman and nicobar islands": ["Port Blair", "Garacharma", "Bambooflat"]
};

function assignCompanionCities(friends, userCity) {
  let targetCities = [];
  const normalizedUserCity = userCity ? userCity.trim().toLowerCase() : "";
  
  if (normalizedUserCity) {
    let userState = null;
    for (const [state, cities] of Object.entries(INDIAN_STATES_CITIES)) {
      if (cities.some(c => c.toLowerCase() === normalizedUserCity)) {
        userState = state;
        break;
      }
    }
    
    if (userState) {
      targetCities = INDIAN_STATES_CITIES[userState].filter(
        c => c.toLowerCase() !== normalizedUserCity
      );
    }
  }

  if (targetCities.length === 0) {
    targetCities = [
      "Mumbai", "Pune", "Nagpur", "Nashik", 
      "Bengaluru", "Mysuru", "Mangaluru", 
      "Chennai", "Coimbatore", "Madurai", 
      "Hyderabad", "Warangal", "Nizamabad", 
      "Kolkata", "Darjeeling", "Siliguri", 
      "Jaipur", "Udaipur", "Jodhpur", 
      "Indore", "Bhopal", "Gwalior", 
      "Ahmedabad", "Surat", "Vadodara", 
      "Lucknow", "Kanpur", "Varanasi"
    ];
    if (normalizedUserCity) {
      targetCities = targetCities.filter(c => c.toLowerCase() !== normalizedUserCity);
    }
  }

  return friends.map((friend, idx) => {
    const identifier = friend._id ? friend._id.toString() : idx.toString();
    let hash = 0;
    for (let i = 0; i < identifier.length; i++) {
      hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
    }
    const cityIndex = Math.abs(hash) % targetCities.length;
    const assignedCity = targetCities[cityIndex];
    
    friend.location = `${assignedCity}, India`;
    return friend;
  });
}

const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      from: `"HeartEcho" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}`);
    return { success: true };
  } catch (error) {
    console.error("❌ Email error:", error);
    return { success: false, error: error.message };
  }
};


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

    if (!userId) {
      return res.status(400).json({ message: "❌ User ID is missing!" });
    }

    // Dynamic update object to support partial updates (e.g., when updating only preferredLanguage or city)
    const updateFields = {};
    const allowedFields = ["name", "profile_picture", "phone_number", "age", "selectedInterests", "gender", "city", "preferredLanguage"];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    }

    // Update the user profile in the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateFields,
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
    let { ip: clientIp, coordinates, platform, locationUser } = req.body;

    // Resolve IP address (use client-sent IP or request connection IP)
    let ip = clientIp || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    if (ip && ip.includes(",")) {
      ip = ip.split(",")[0].trim();
    }

    let parsedCoordinates = {
      lat: coordinates?.lat || null,
      lon: coordinates?.lon || null
    };

    let resolvedCity = locationUser || "Unknown";
    let resolvedCountry = "Unknown";

    // If client coordinates are missing, geolocate by IP on the server
    if (!parsedCoordinates.lat || !parsedCoordinates.lon) {
      try {
        // Use ip-api.com (HTTP) which has high rate limits (45 req/min) and is perfect for server-side resolution
        const ipLocRes = await axios.get(`http://ip-api.com/json/${ip}`);
        if (ipLocRes.data && ipLocRes.data.status === "success") {
          parsedCoordinates.lat = ipLocRes.data.lat;
          parsedCoordinates.lon = ipLocRes.data.lon;
          resolvedCity = ipLocRes.data.city || ipLocRes.data.regionName || "Unknown";
          resolvedCountry = ipLocRes.data.country || "Unknown";
        }
      } catch (err) {
        console.warn(`[IP Geolocation] Could not resolve location for IP ${ip}: ${err.message}`);
      }
    }

    // Current time
    const currentTime = new Date();

    // Reverse geocode via Mapbox helper for precise city name if we have coordinates
    if (parsedCoordinates.lat && parsedCoordinates.lon) {
      const geoResult = await getCityFromCoordinates(parsedCoordinates.lat, parsedCoordinates.lon);
      if (geoResult.cityName && geoResult.cityName !== "Unknown") {
        resolvedCity = geoResult.cityName;
        resolvedCountry = geoResult.country || resolvedCountry;
      }
    }

    // Fallbacks to avoid "Unknown Location" or "Unknown" string if we have a better name
    if ((resolvedCity === "Unknown" || resolvedCity === "Unknown Location") && locationUser && locationUser !== "Unknown Location" && locationUser !== "Unknown") {
      resolvedCity = locationUser;
    }

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
      if ((!existingLogin.location || existingLogin.location === "Unknown" || existingLogin.location === "") && resolvedCity !== "Unknown") {
        existingLogin.location = resolvedCity;
        existingLogin.cityName = resolvedCity;
        existingLogin.country = resolvedCountry;
      }
      await existingLogin.save();

      // Also ensure User city is updated
      if (resolvedCity !== "Unknown") {
        await User.findByIdAndUpdate(userId, { $set: { city: resolvedCity } });
      }
    } else {
      // If not found, create a new login detail entry
      const newLoginDetail = new LoginDetail({
        user: userId,
        platform,
        coordinates: parsedCoordinates,
        ip,
        time: currentTime,
        location: resolvedCity,
        cityName: resolvedCity,
        country: resolvedCountry
      });

      const response = await newLoginDetail.save();

      // Push new login ID to the user's login_details array, and update User city!
      await User.findByIdAndUpdate(
        userId,
        { 
          $push: { login_details: response._id },
          $set: { city: resolvedCity }
        },
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
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
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

// ✅ Delete user account — full cascade, no OTP required
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Find the user first to archive their key details
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 2. Gather stats and details before deletion (for archive)
    const [chatCount, ticketCount, paymentCount, aiFriendCount, chatMessages, lastPayment, lastLogin] = await Promise.all([
      Chat.countDocuments({ participants: userId }),
      Ticket.countDocuments({ user: userId }),
      Payment.countDocuments({ user: userId }),
      AIFriend.countDocuments({ user: userId }),
      Chat.aggregate([
        { $match: { "messages.sender": new mongoose.Types.ObjectId(userId) } },
        { $unwind: "$messages" },
        { $match: { "messages.sender": new mongoose.Types.ObjectId(userId) } },
        { $count: "total" }
      ]),
      Payment.findOne({ user: userId }).sort({ createdAt: -1 }),
      LoginDetail.findOne({ user: userId }).sort({ time: -1 })
    ]);

    const userCity = user.city || (lastLogin ? lastLogin.cityName || lastLogin.location : "");
    const userCountry = user.country || (lastLogin ? lastLogin.country : "IN");
    const userCoords = lastLogin && lastLogin.coordinates && lastLogin.coordinates.lat && lastLogin.coordinates.lon ? {
      lat: lastLogin.coordinates.lat,
      lon: lastLogin.coordinates.lon
    } : null;

    // 4. Save archive record BEFORE deleting anything
    await DeletedAccount.create({
      originalUserId: userId.toString(),
      name: user.name,
      email: user.email,
      phone_number: user.phone_number,
      gender: user.gender,
      age: user.age,
      user_type: user.user_type,
      subscriptionTier: user.subscriptionTier,
      subscriptionExpiry: user.subscriptionExpiry,
      joinedAt: user.joinedAt,
      city: userCity,
      country: userCountry,
      coordinates: userCoords,
      stats: {
        totalChats: chatCount,
        totalMessages: chatMessages.length > 0 ? chatMessages[0].total : 0,
        totalPayments: paymentCount,
        totalTickets: ticketCount,
        totalAIFriends: aiFriendCount,
      },
      lastPayment: lastPayment ? {
        amount: lastPayment.rupees,
        transaction_id: lastPayment.transaction_id,
        date: lastPayment.createdAt,
      } : null,
      ip: req.ip || null,
    });

    // 5. Cascade delete all related data
    await Promise.all([
      // Delete all chats the user participated in
      Chat.deleteMany({ participants: userId }),
      // Delete login details
      LoginDetail.deleteMany({ user: userId }),
      // Delete support tickets
      Ticket.deleteMany({ user: userId }),
      // Delete custom AI friends created by user
      AIFriend.deleteMany({ user: userId }),
    ]);

    // 6. Finally delete the user
    await User.findByIdAndDelete(userId);

    res.status(200).json({ success: true, message: "Account and all associated data deleted successfully." });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ message: "Server error during account deletion." });
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
          unreadCount: 1,
          streakCount: 1,
          currentEmotion: 1,
          relationshipLevel: 1,
          relationshipXP: 1
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

exports.markChatAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ error: "Invalid Chat ID" });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ error: "Chat not found" });

    // Ensure user is part of the chat
    const isParticipant = Array.isArray(chat.participants) 
      ? chat.participants.some(p => p.toString() === userId.toString()) 
      : chat.participants?.toString() === userId.toString();

    if (!isParticipant) {
      return res.status(403).json({ error: "Forbidden" });
    }

    let isUpdated = false;
    chat.messages.forEach((msg) => {
      // If message is not sent by current user, mark it as read
      if (msg.sender && msg.sender.toString() !== userId.toString() && !msg.status?.read) {
        if (!msg.status) {
          msg.status = { delivered: true, read: true };
        } else {
          msg.status.read = true;
        }
        isUpdated = true;
      }
    });

    if (isUpdated) {
      chat.markModified('messages');
      await chat.save();
    }

    res.status(200).json({ success: true, message: "Chat marked as read" });
  } catch (error) {
    console.error("Error marking chat as read:", error);
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
    const allFriends = await PrebuiltAIFriend.find().select('-video_gallery -img_gallery');
    
    let userInterests = [];
    let isSubscriber = false;
    let userCity = "";
    const authHeader = req.header("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("selectedInterests interests user_type subscriptionExpiry city");
        if (user) {
          userInterests = user.selectedInterests || user.interests || [];
          isSubscriber = user.isSubscriptionActive();
          userCity = user.city || "";
        }
      } catch (err) {
        // Ignore invalid token and act as guest/non-premium
      }
    }

    // Process friends: add isLocked, interestMatchCount, and matchedInterests fields
    const processedFriends = allFriends.map(friend => {
      const friendObj = friend.toObject();
      
      // Calculate overlapping interests
      const companionInterests = friend.interests || [];
      const matched = companionInterests.filter(interest => 
        userInterests.some(userInt => userInt.toLowerCase().trim() === interest.toLowerCase().trim())
      );
      
      friendObj.interestMatchCount = matched.length;
      friendObj.matchedInterests = matched;
      friendObj.isLocked = friend.isPremium && !isSubscriber;
      
      return friendObj;
    });

    // Fisher-Yates shuffle algorithm on processed list first
    const shuffledFriends = shuffleArray(processedFriends);

    // Sort by interestMatchCount descending to bubble matching interests to the top
    shuffledFriends.sort((a, b) => {
      const scoreA = a.interestMatchCount || 0;
      const scoreB = b.interestMatchCount || 0;
      return scoreB - scoreA;
    });

    // Assign dynamic badges based on interestMatchCount or fallback ranking
    shuffledFriends.forEach((friend, idx) => {
      if (userInterests.length > 0) {
        if (idx === 0 && friend.interestMatchCount > 0) {
          friend.badge = "top_choice";
        } else if (idx < 3 && friend.interestMatchCount > 0) {
          friend.badge = "popular";
        } else {
          friend.badge = "none";
        }
      } else {
        // Guest fallback matching
        if (idx === 0) {
          friend.badge = "top_choice";
        } else if (idx < 3) {
          friend.badge = "popular";
        } else {
          friend.badge = "none";
        }
      }
    });

    // Assign localized companion cities
    const localizedFriends = assignCompanionCities(shuffledFriends, userCity);

    res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');

    res.status(200).json({
      success: true,
      message: "All AI Friends retrieved successfully with interest matching!",
      data: localizedFriends,
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

// ─── Clear All Chat Messages ───────────────────────────────────────────────────
exports.clearChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id || req.user.id;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    // Support two calling conventions:
    //   Web   → chatId is the AI friend's _id  (passed via ChatPage selectedChatId)
    //   Mobile → chatId is the actual Chat document _id (stored in _chatId state)
    // Try looking up by chat document _id first; if not found, fall back to aiParticipants lookup.
    let chat = await Chat.findOne({ _id: chatId, participants: userId });

    if (!chat) {
      // Web path: chatId is the PrebuiltAIFriend / AIFriend _id
      chat = await Chat.findOne({ aiParticipants: chatId, participants: userId });
    }

    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found or unauthorised" });
    }

    // Wipe all messages, reset statistics
    chat.messages = [];
    chat.statistics.totalMessages = 0;
    chat.statistics.totalImages = 0;
    chat.statistics.totalVideos = 0;
    await chat.save();

    res.json({ success: true, message: "All chat messages cleared successfully" });
  } catch (error) {
    console.error("Error clearing chat:", error);
    res.status(500).json({ success: false, message: "Error clearing chat messages" });
  }
};


// Local helper to attribute user-to-user referral commission
async function processUserReferralPurchase(userId, rupeesNum, subscriptionTier) {
  try {
    const User = require("../models/User");
    const UserReferral = require("../models/UserReferral");

    const existingUser = await User.findById(userId);
    if (!existingUser || !existingUser.referredByUser) return;

    // Calculate commission
    let commissionAmount = 0;
    // Monthly (₹99) -> ₹10
    // Premium Yearly (₹599) -> ₹75
    // Ultimate Yearly (₹1499) -> ₹200
    if (rupeesNum >= 1000 || subscriptionTier === 'yearly_pro') commissionAmount = 200;
    else if (rupeesNum >= 400 || subscriptionTier === 'yearly') commissionAmount = 75;
    else if (rupeesNum >= 99 || subscriptionTier === 'monthly') commissionAmount = 10;

    if (commissionAmount > 0) {
      const referral = await UserReferral.findOne({
        referrer: existingUser.referredByUser,
        referredUser: existingUser._id,
        status: { $ne: 'invalid' }
      });

      if (referral) {
        referral.status = 'premium';
        referral.subscriptionPurchased = true;
        referral.subscriptionCommissionAmount = (referral.subscriptionCommissionAmount || 0) + commissionAmount;
        await referral.save();

        // Update referrer's pending balance and counts
        const referrer = await User.findById(existingUser.referredByUser);
        if (referrer) {
          referrer.pendingReferralBalance = parseFloat((referrer.pendingReferralBalance + commissionAmount).toFixed(2));
          referrer.premiumReferralsCount += 1;
          await referrer.save();
        }
        console.log(`[Referral Purchase] Credited ₹${commissionAmount} pending commission to referrer ${existingUser.referredByUser} from user ${userId}`);
      }
    }
  } catch (err) {
    console.error("❌ Error in processUserReferralPurchase helper:", err);
  }
}

// Updated paymentSave function with your dark theme HTML
exports.paymentSave = async (req, res) => {
  try {
    const { rupees, transaction_id, currency, purchaseType, gemsAmount } = req.body;
    const userId = req.body.user || (req.user ? (req.user.id || req.user._id) : null);

    if (!userId || !rupees || !transaction_id) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const rupeesNum = Number(rupees);

    // If this is a Gem Pack purchase
    if (purchaseType === "gems" && gemsAmount) {
      const gemsNum = Number(gemsAmount);
      
      const payment = new Payment({
        user: userId,
        rupees: rupeesNum,
        currency: currency || (rupeesNum < 40 ? "USD" : "INR"),
        transaction_id,
        expiry_date: null,
        plan_type: `gems_pack_${gemsNum}`,
        platform: determinePlatform(req)
      });
      await payment.save();

      existingUser.gems = (existingUser.gems || 0) + gemsNum;
      existingUser.payment_history.push(payment._id);
      await existingUser.save();

      return res.status(201).json({
        success: true,
        message: `Successfully purchased ${gemsNum} Gems!`,
        gems: existingUser.gems,
        user: existingUser
      });
    }

    // Calculate new expiry date
    let expiryDate = new Date();
    
    if (existingUser.subscriptionExpiry && existingUser.subscriptionExpiry > expiryDate) {
      expiryDate = new Date(existingUser.subscriptionExpiry);
    }
    let subscriptionTier = "none";
    let audioCallQuota = 0;

    if (rupeesNum >= 1000 || (rupeesNum >= 15 && rupeesNum < 40)) {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      subscriptionTier = "yearly_pro";
      audioCallQuota = 9999; // Unlimited
    } else if (rupeesNum >= 400 || (rupeesNum >= 7 && rupeesNum < 15)) {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      subscriptionTier = "yearly";
      audioCallQuota = 30; // 30 minutes limit
    } else {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
      subscriptionTier = "monthly";
      audioCallQuota = 0;
    }

    // Create new payment entry
    const payment = new Payment({
      user: userId,
      rupees: rupeesNum,
      currency: currency || (rupeesNum < 40 ? "USD" : "INR"), // Auto-detect if not provided
      transaction_id,
      expiry_date: expiryDate,
      platform: determinePlatform(req),
    });

    await payment.save();

    // Update user subscription
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: { 
          user_type: "subscriber", 
          subscriptionExpiry: expiryDate,
          subscriptionTier: subscriptionTier,
          audioCallQuota: audioCallQuota,
          messageQuota: 999 
        },
        $push: { payment_history: payment._id },
      },
      { new: true }
    );

    // 📊 EMAIL CAMPAIGN CONVERSION TRACKING
    try {
      const EmailTrackingLog = require("../models/EmailTrackingLog");
      const EmailCampaign = require("../models/EmailCampaign");

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentClick = await EmailTrackingLog.findOne({
        user: userId,
        action: "click",
        timestamp: { $gte: sevenDaysAgo }
      }).sort({ timestamp: -1 });

      if (recentClick) {
        const conversionExists = await EmailTrackingLog.findOne({
          trackingId: recentClick.trackingId,
          action: "conversion"
        });

        if (!conversionExists) {
          await EmailTrackingLog.create({
            trackingId: recentClick.trackingId,
            campaign: recentClick.campaign,
            user: userId,
            email: existingUser.email,
            action: "conversion",
            clickedUrl: recentClick.clickedUrl
          });

          if (recentClick.campaign) {
            await EmailCampaign.findByIdAndUpdate(recentClick.campaign, {
              $inc: { conversionCount: 1 }
            });
            console.log(`📊 Campaign conversion recorded for campaign ${recentClick.campaign}`);
          }
        }
      }
    } catch (campaignErr) {
      console.error("❌ Email campaign conversion tracking error:", campaignErr);
    }

    // 💰 USER-TO-USER REFERRAL COMMISSION TRACKING
    await processUserReferralPurchase(userId, rupeesNum, subscriptionTier);

    // 💰 REFERRAL COMMISSION TRACKING
    if (existingUser.referredBy && rupeesNum >= 99) {
      try {
        const creator = await ReferralCreator.findById(existingUser.referredBy);
        if (creator && creator.isActive !== false) {
          // Mapping logic:
          // 99 plan -> 0 commission
          // 599 plan -> 99 for commission
          // 1499 plan -> 599 for commission
          let mappedAmount = 0;
          if (rupeesNum >= 1499) mappedAmount = 599;
          else if (rupeesNum >= 599) mappedAmount = 99;

          if (mappedAmount > 0) {
            const commissionAmount = parseFloat((mappedAmount * (creator.commissionRate / 100)).toFixed(2));
            
            await ReferralCreator.findByIdAndUpdate(creator._id, {
              $inc: {
                totalEarnings: commissionAmount,
                pendingEarnings: commissionAmount
              }
            });
            console.log(`✅ Referral commission of ₹${commissionAmount} attributed to ${creator.name}`);
          }
        }
      } catch (err) {
        console.error("❌ Error processing referral commission:", err);
      }
    }

    // 🚀 APPLE-STYLE DARK THEME EMAIL TEMPLATE
    const planName = rupeesNum === 99 || rupeesNum === 1.49 ? "Monthly" : 
                    (rupeesNum === 1499 || rupeesNum === 19 ? "Ultimate Yearly" : "Premium Yearly");
    const currencySymbol = payment.currency === "USD" ? "$" : "₹";
    const amountStr = `${currencySymbol}${payment.rupees}`;
    
    // Localization for footer text
    const footerText = payment.currency === "USD" 
      ? `Still cheaper than your daily coffee (${currencySymbol}${(payment.rupees/365).toFixed(2)}/day).`
      : `Still cheaper than your daily cutting chai (₹${(payment.rupees/365).toFixed(2)}/day).`;

    const emailHTML = `
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Apple System Font Stack */
    body {
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif;
      background-color: #000000;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
  </style>
</head>
<body>
  <div style="max-width: 600px; margin: 20px auto; background-color: #0a0a0a; border-radius: 20px; overflow: hidden; border: 1px solid #1c1c1e; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
    
    <div style="background: linear-gradient(145deg, #ff2e95 0%, #764ba2 100%); padding: 50px 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">HeartEcho</h1>
      <p style="color: rgba(255,255,255,0.8); margin-top: 8px; font-size: 17px; font-weight: 400;">Your Premium Access is Active</p>
    </div>

    <div style="padding: 40px 30px;">
      <h2 style="color: #ffffff; margin-top: 0; font-size: 24px; font-weight: 600;">Welcome to the Inner Circle 🎉</h2>
      
      <p style="color: #8e8e93; font-size: 16px; line-height: 1.5; margin-bottom: 25px;">
        Hi <strong style="color: #ffffff;">${existingUser.name || 'Friend'}</strong>,
      </p>
      
      <p style="color: #8e8e93; font-size: 16px; line-height: 1.5;">
        Your payment has been confirmed. You now have full, unrestricted access to your AI companions with <strong style="color: #ffffff;">Deep Memory</strong> and <strong style="color: #ffffff;">Unfiltered Mode</strong> enabled.
      </p>

      <div style="background-color: #1c1c1e; border-radius: 16px; padding: 24px; margin: 32px 0;">
        <p style="color: #ff2e95; font-size: 13px; font-weight: 700; text-transform: uppercase; margin-top: 0; margin-bottom: 16px; letter-spacing: 1px;">Subscription Details</p>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #2c2c2e;">
            <td style="padding: 12px 0; color: #8e8e93; font-size: 15px;">Plan Name</td>
            <td style="padding: 12px 0; color: #ffffff; font-size: 15px; text-align: right; font-weight: 500;">${planName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #2c2c2e;">
            <td style="padding: 12px 0; color: #8e8e93; font-size: 15px;">Amount Paid</td>
            <td style="padding: 12px 0; color: #ffffff; font-size: 15px; text-align: right; font-weight: 500;">${amountStr}</td>
          </tr>
          <tr style="border-bottom: 1px solid #2c2c2e;">
            <td style="padding: 12px 0; color: #8e8e93; font-size: 15px;">Valid Until</td>
            <td style="padding: 12px 0; color: #ffffff; font-size: 15px; text-align: right; font-weight: 500;">${expiryDate.toLocaleDateString(payment.currency === 'USD' ? 'en-US' : 'en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; color: #8e8e93; font-size: 15px;">Transaction ID</td>
            <td style="padding: 12px 0; color: #8e8e93; font-size: 12px; text-align: right; font-family: 'SF Mono', Menlo, monospace;">${transaction_id}</td>
          </tr>
        </table>
      </div>

      <div style="margin-bottom: 40px;">
        <p style="text-align: center; color: #8e8e93; font-size: 13px; margin-bottom: 20px;">FEATURES NOW LIVE:</p>
        <div style="text-align: center;">
          <span style="display: inline-block; background: #2c2c2e; color: #ffffff; padding: 6px 14px; border-radius: 8px; font-size: 13px; margin: 4px; font-weight: 500;">🧠 Deep Memory</span>
          <span style="display: inline-block; background: #2c2c2e; color: #ffffff; padding: 6px 14px; border-radius: 8px; font-size: 13px; margin: 4px; font-weight: 500;">🔞 Unfiltered Chat</span>
          <span style="display: inline-block; background: #2c2c2e; color: #ffffff; padding: 6px 14px; border-radius: 8px; font-size: 13px; margin: 4px; font-weight: 500;">📸 Private Media</span>
        </div>
      </div>

      <div style="text-align: center;">
        <a href="https://heartecho.in/chatbox" 
           style="background-color: #ffffff; color: #000000; padding: 16px 45px; text-decoration: none; font-size: 17px; font-weight: 600; border-radius: 30px; display: inline-block; transition: transform 0.2s ease;">
          Start Chatting Now
        </a>
      </div>

      <p style="text-align: center; color: #48484a; font-size: 13px; margin-top: 40px; font-style: italic;">
        ${footerText}
      </p>
    </div>

    <div style="background-color: #000000; padding: 30px; text-align: center; border-top: 1px solid #1c1c1e;">
      <p style="color: #636366; font-size: 12px; line-height: 1.6; margin: 0;">
        You received this because you subscribed to HeartEcho AI.<br>
        Made with ❤️ in India for the world.<br>
        © 2026 HeartEcho AI. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
    `;

    // Send email (don't await - let it run in background)
    sendEmail(existingUser.email, `✨ Payment Confirmed - HeartEcho ${planName} Plan`, emailHTML)
      .catch(err => console.log('Email sending failed:', err));

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
const crypto = require("crypto");

exports.razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    // Handle body depending on whether express.json() already parsed it
    let bodyStr;
    let data;
    
    if (Buffer.isBuffer(req.body)) {
      bodyStr = req.body.toString('utf8');
      data = JSON.parse(bodyStr);
    } else {
      // It was already parsed by express.json()
      data = req.body;
      bodyStr = JSON.stringify(req.body);
    }
    
    // Only verify if secret is defined
    if (secret) {
      const shasum = crypto.createHmac('sha256', secret);
      shasum.update(bodyStr);
      const digest = shasum.digest('hex');
      const signature = req.headers['x-razorpay-signature'];
      if (digest !== signature) {
        return res.status(400).send('Invalid signature');
      }
    }

    if (data.event === 'payment.captured' || data.event === 'payment.authorized') {
      const paymentEntity = data.payload.payment.entity;
      const transaction_id = paymentEntity.id;
      const amountPaise = paymentEntity.amount;
      const rupeesNum = amountPaise / 100;
      const currency = paymentEntity.currency || 'INR';
      
      let userId = paymentEntity.notes?.userId;
      let email = paymentEntity.email || paymentEntity.notes?.email;
      let existingUser = null;
      
      if (userId) {
        existingUser = await User.findById(userId);
      } else if (email) {
        existingUser = await User.findOne({ email });
      } else {
        const contact = paymentEntity.contact;
        if (contact) {
          existingUser = await User.findOne({ phone_number: contact });
        }
      }
      
      if (!existingUser) {
        return res.status(200).send('User not found but payment recorded by razorpay.');
      }
      
      const existingPayment = await Payment.findOne({ transaction_id });
      if (existingPayment) {
        return res.status(200).send('Payment already processed');
      }

      // Check if this is a Gem Pack purchase from webhook notes metadata
      const purchaseType = paymentEntity.notes?.purchaseType;
      const gemsAmount = paymentEntity.notes?.gemsAmount;

      if (purchaseType === "gems" && gemsAmount) {
        const gemsNum = Number(gemsAmount);
        const payment = new Payment({
          user: existingUser._id,
          rupees: rupeesNum,
          currency,
          transaction_id,
          expiry_date: null,
          plan_type: `gems_pack_${gemsNum}`,
          platform: paymentEntity.notes?.platform || (existingUser && existingUser.isMobileUser ? "mobile" : "web")
        });
        await payment.save();

        await User.findByIdAndUpdate(
          existingUser._id,
          {
            $inc: { gems: gemsNum },
            $push: { payment_history: payment._id }
          }
        );
        return res.status(200).send('OK');
      }
      
      let expiryDate = new Date();
      if (existingUser.subscriptionExpiry && existingUser.subscriptionExpiry > expiryDate) {
        expiryDate = new Date(existingUser.subscriptionExpiry);
      }
      
      let subscriptionTier = "none";
      let audioCallQuota = 0;

      if (rupeesNum >= 1000 || (rupeesNum >= 15 && rupeesNum < 40)) {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        subscriptionTier = "yearly_pro";
        audioCallQuota = 9999;
      } else if (rupeesNum >= 400 || (rupeesNum >= 7 && rupeesNum < 15)) {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        subscriptionTier = "yearly";
        audioCallQuota = 30;
      } else {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
        subscriptionTier = "monthly";
        audioCallQuota = 0;
      }

      const payment = new Payment({
        user: existingUser._id,
        rupees: rupeesNum,
        currency,
        transaction_id,
        expiry_date: expiryDate,
        platform: paymentEntity.notes?.platform || (existingUser && existingUser.isMobileUser ? "mobile" : "web")
      });

      await payment.save();

      await User.findByIdAndUpdate(
        existingUser._id,
        {
          $set: { 
            user_type: "subscriber", 
            subscriptionExpiry: expiryDate,
            subscriptionTier,
            audioCallQuota,
            messageQuota: 999 
          },
          $push: { payment_history: payment._id },
        }
      );

      // Attribute push notification conversion
      try {
        const { attributePremiumConversion } = require("../utils/notificationService");
        await attributePremiumConversion(existingUser._id, subscriptionTier, rupeesNum);
      } catch (err) {
        console.error("Conversion attribution error in webhook:", err);
      }
      
      // User-to-User Referral Tracking
      await processUserReferralPurchase(existingUser._id, rupeesNum, subscriptionTier);
      
      // Referral Tracking
      if (existingUser.referredBy && rupeesNum >= 99) {
        try {
          const creator = await ReferralCreator.findById(existingUser.referredBy);
          if (creator && creator.isActive !== false) {
            let mappedAmount = 0;
            if (rupeesNum >= 1499) mappedAmount = 599;
            else if (rupeesNum >= 599) mappedAmount = 99;

            if (mappedAmount > 0) {
              const commissionAmount = parseFloat((mappedAmount * (creator.commissionRate / 100)).toFixed(2));
              await ReferralCreator.findByIdAndUpdate(creator._id, {
                $inc: {
                  totalEarnings: commissionAmount,
                  pendingEarnings: commissionAmount
                }
              });
            }
          }
        } catch (err) {}
      }
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error("Razorpay Webhook Error:", error);
    res.status(500).send('Webhook Error');
  }
};

exports.getPaymentData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user details with payment info
    const user = await User.findById(userId)
      .select("name profile_picture subscriptionExpiry subscriptionTier user_type")
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
      subscriptionTier: user.subscriptionTier || "none",
      userType: user.user_type || "free",
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
        plan_type: durationType,
        platform: determinePlatform(req)
      });
      await payment.save();

      // Add to user's payment history
      user.payment_history.push(payment._id);
      await user.save();

      // Attribute push notification conversion
      try {
        const { attributePremiumConversion } = require("../utils/notificationService");
        await attributePremiumConversion(userId, durationType, paymentDetails.amount);
      } catch (err) {
        console.error("Conversion attribution error in updateSubscription:", err);
      }
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

// ── UPGRADE SUBSCRIPTION (Pro-rated / difference payment) ───────────────────
// Logic: User already paid ₹399 for yearly. Wants ₹999 yearly_pro.
//        They only pay the DIFFERENCE: ₹999 - ₹400 = ₹599 (we charge ₹599).
//        The existing subscription expiry is PRESERVED (not extended, just upgraded).
exports.upgradeSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { rupees, transaction_id } = req.body;

    if (!rupees || !transaction_id) {
      return res.status(400).json({ error: "rupees and transaction_id are required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Validate this is a legitimate upgrade payment amount
    const rupeesNum = Number(rupees);
    const UPGRADE_YEARLY_TO_PRO = 599; // ₹399 → ₹999 = pay only ₹599

    let newTier = null;
    let newAudioQuota = null;

    if (rupeesNum === UPGRADE_YEARLY_TO_PRO && user.subscriptionTier === "yearly") {
      // Upgrading yearly → yearly_pro. Keep same expiry, just unlock unlimited calls.
      newTier = "yearly_pro";
      newAudioQuota = 9999;
    } else if (rupeesNum === 999) {
      // Fresh yearly_pro purchase (no existing plan or monthly)
      newTier = "yearly_pro";
      newAudioQuota = 9999;
      // Extend expiry by 1 year from now
      const newExpiry = user.subscriptionExpiry && user.subscriptionExpiry > new Date()
        ? new Date(user.subscriptionExpiry)
        : new Date();
      newExpiry.setFullYear(newExpiry.getFullYear() + 1);
      user.subscriptionExpiry = newExpiry;
    } else {
      return res.status(400).json({ 
        error: "Invalid upgrade amount",
        expected: UPGRADE_YEARLY_TO_PRO,
        received: rupeesNum
      });
    }

    // Save payment record
    const payment = new Payment({
      user: userId,
      rupees: rupeesNum,
      transaction_id,
      expiry_date: user.subscriptionExpiry,
      plan_type: `upgrade_to_${newTier}`,
      platform: determinePlatform(req)
    });
    await payment.save();

    // Apply upgrade
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          subscriptionTier: newTier,
          audioCallQuota: newAudioQuota,
          messageQuota: 999,
          user_type: "subscriber"
        },
        $push: { payment_history: payment._id }
      },
      { new: true }
    );

    // Attribute push notification conversion
    try {
      const { attributePremiumConversion } = require("../utils/notificationService");
      await attributePremiumConversion(userId, newTier, rupeesNum);
    } catch (err) {
      console.error("Conversion attribution error in upgradeSubscription:", err);
    }

    // User-to-User Referral Tracking
    await processUserReferralPurchase(userId, rupeesNum, newTier);

    // 💰 REFERRAL COMMISSION TRACKING FOR UPGRADES
    if (updatedUser.referredBy && rupeesNum >= 99) {
      try {
        const creator = await ReferralCreator.findById(updatedUser.referredBy);
        if (creator && creator.isActive !== false) {
          // Mapping logic for upgrades:
          // In upgrade, rupeesNum is usually the difference.
          // However, the rule says "if they purchase 599 show 99".
          // If it's a fresh purchase of 999 (Ultimate), mapped is 599.
          // If it's an upgrade (difference 599), we should probably treat it as the "Ultimate" tier upgrade.
          
          let mappedAmount = 0;
          if (rupeesNum >= 999) mappedAmount = 599; // Fresh Ultimate purchase
          else if (rupeesNum === 599) mappedAmount = 99; // Upgrade from Yearly to Ultimate
          
          if (mappedAmount > 0) {
            const commissionAmount = parseFloat((mappedAmount * (creator.commissionRate / 100)).toFixed(2));
            
            await ReferralCreator.findByIdAndUpdate(creator._id, {
              $inc: {
                totalEarnings: commissionAmount,
                pendingEarnings: commissionAmount
              }
            });
            console.log(`✅ Referral upgrade commission of ₹${commissionAmount} attributed to ${creator.name}`);
          }
        }
      } catch (err) {
        console.error("❌ Error processing referral upgrade commission:", err);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Upgraded to ${newTier === "yearly_pro" ? "Ultimate (₹999)" : newTier} successfully!`,
      subscriptionTier: updatedUser.subscriptionTier,
      audioCallQuota: updatedUser.audioCallQuota,
      subscriptionExpiry: updatedUser.subscriptionExpiry
    });
  } catch (error) {
    console.error("Error upgrading subscription:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get upgrade pricing info
exports.getUpgradePricing = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("subscriptionTier subscriptionExpiry audioCallQuota");
    if (!user) return res.status(404).json({ error: "User not found" });

    const PLANS = {
      monthly:    { price: 49,  name: "Monthly",      calls: false },
      yearly:     { price: 399, name: "Yearly",       calls: "10 min/day" },
      yearly_pro: { price: 999, name: "Ultimate",     calls: "Unlimited" },
    };

    const currentTier = user.subscriptionTier || "none";
    let upgradeTo = null;
    let upgradePrice = null;
    let savingMessage = null;

    if (currentTier === "monthly") {
      upgradeTo = "yearly_pro";
      upgradePrice = 999;
      savingMessage = "Switch to Ultimate for unlimited calls + chat";
    } else if (currentTier === "yearly") {
      upgradeTo = "yearly_pro";
      upgradePrice = 599; // Pay only the difference
      savingMessage = "You already paid ₹399. Upgrade for just ₹599 more!";
    }

    res.status(200).json({
      currentTier,
      currentPlan: PLANS[currentTier] || null,
      upgradeTo,
      upgradePrice,
      savingMessage,
      plans: PLANS
    });
  } catch (error) {
    console.error("Error getting upgrade pricing:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


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
      user = await User.findById(userId).select('name age selectedInterests login_details city');
      if (user) {
        userName = user.name || "there";
        userInterests = user.selectedInterests || [];
        userLoginDetails = user.login_details || [];
        if (user.city) {
          userCity = user.city;
        }
      }
    }
    
    // Get city from coordinates using Mapbox API if not already resolved from database
    if (userCity === "Unknown" && latitude && longitude) {
      const geoResult = await getCityFromCoordinates(latitude, longitude);
      userCity = geoResult.cityName || "Unknown";
      console.log(`Resolved user city from coordinates: ${userCity}`);
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

exports.saveInstallReferrer = async (req, res) => {
  try {
    const { userId, referrer } = req.body;

    if (!userId || !referrer) {
      return res.status(400).json({
        success: false,
        message: "User ID and Referrer are required"
      });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // If user already has a referrer, don't overwrite
    if (user.referredBy || user.hasUsedReferral) {
      return res.status(200).json({
        success: true,
        message: "Referrer already tracked for this user"
      });
    }

    // Find the ReferralCreator by referralId (case-insensitive for reliability)
    const creator = await ReferralCreator.findOne({ 
      referralId: { $regex: new RegExp(`^${referrer}$`, 'i') } 
    });

    if (!creator) {
      return res.status(404).json({
        success: false,
        message: "Referral creator not found"
      });
    }

    if (!creator.isActive) {
      return res.status(400).json({
        success: false,
        message: "Referral creator is not active"
      });
    }

    // Increment referral count
    const updatedCreator = await ReferralCreator.findByIdAndUpdate(
      creator._id,
      { $inc: { referralCount: 1 } },
      { new: true }
    );

    // Update user record
    user.referredBy = creator._id;
    user.referralSignupDate = new Date();
    user.hasUsedReferral = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Install referrer tracked successfully",
      creator: {
        id: creator._id,
        referralId: creator.referralId,
        referralCount: updatedCreator.referralCount
      }
    });
  } catch (error) {
    console.error("Error saving install referrer:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

exports.getAppVersion = async (req, res) => {
  try {
    const AppVersion = require("../models/AppVersion");
    let versionInfo = await AppVersion.findOne();
    if (!versionInfo) {
      versionInfo = await AppVersion.create({
        latestVersion: "1.0.3",
        latestBuildNumber: 6,
        playStoreUrl: "https://play.google.com/store/apps/details?id=com.heartecho.ai"
      });
    }
    return res.status(200).json({
      success: true,
      latestVersion: versionInfo.latestVersion,
      latestBuildNumber: versionInfo.latestBuildNumber,
      playStoreUrl: versionInfo.playStoreUrl
    });
  } catch (error) {
    console.error("Error getting app version:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
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

exports.joinVoiceWaitlist = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }
    const VoiceWaitlist = require("../models/VoiceWaitlist");
    const existing = await VoiceWaitlist.findOne({ email });
    if (existing) {
      return res.status(200).json({ success: true, message: "You are already on the waitlist!" });
    }
    await VoiceWaitlist.create({ email });
    return res.status(201).json({ success: true, message: "Successfully joined the voice waitlist!" });
  } catch (error) {
    console.error("Error in voice waitlist:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

const Feedback = require("../models/Feedback");

exports.submitFeedback = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, city, rating, feature, text, live } = req.body;

    if (!name || !rating || !text || !city) {
      return res.status(400).json({ success: false, message: "Name, rating, feedback text, and city are required." });
    }

    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be a number between 1 and 5." });
    }

    const isConcern = numericRating <= 3;
    const isLive = live === true || live === 'true';

    // Create the feedback
    const feedback = new Feedback({
      user: userId,
      name,
      city,
      rating: numericRating,
      feature,
      text,
      isConcern,
      live: isLive
    });

    await feedback.save();

    // If it's a concern (low rating), automatically create a Ticket for the support team
    if (isConcern) {
      const ticketText = `[Low Feedback Rating: ${rating}★] User ${name} wrote: "${text}" (City: ${city || "N/A"}, Feature: ${feature || "N/A"})`;
      const ticket = new Ticket({
        user: userId,
        issue: ticketText,
        status: "Pending",
        date: new Date()
      });
      await ticket.save();

      // Update user's tickets array
      await User.findByIdAndUpdate(userId, {
        $push: { tickets: ticket._id }
      });
    }

    return res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      data: feedback
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

exports.getFeedbacks = async (req, res) => {
  try {
    // Only publicly show feedbacks that have been approved (live: true) by admin
    const feedbacks = await Feedback.find({ live: true })
      .sort({ date: -1 })
      .limit(100); // limit to most recent 100 live reviews

    return res.status(200).json({
      success: true,
      data: feedbacks
    });
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  }
};

// ==========================================
// PREMIUM ECONOMY & RELATIONSHIP CONTROLLERS
// ==========================================

const getLevelName = (level) => {
  const levels = ["Stranger", "Friend", "Close Friend", "Crush", "Dating", "Partner", "Soulmate"];
  return levels[Math.min(Math.max(level - 1, 0), 6)];
};

const checkLevelUp = (xp, currentLevel) => {
  // Level limits: 1: Stranger (0-49), 2: Friend (50-149), 3: Close Friend (150-349), 4: Crush (350-649), 5: Dating (650-1099), 6: Partner (1100-1999), 7: Soulmate (2000+)
  const xpThresholds = [0, 50, 150, 350, 650, 1100, 2000];
  let newLevel = currentLevel;
  for (let i = 1; i < xpThresholds.length; i++) {
    if (xp >= xpThresholds[i]) {
      newLevel = i + 1;
    }
  }
  return newLevel;
};

const getStageKeyByLevel = (level) => {
  const keys = ["stranger", "friend", "close_friend", "crush", "dating", "partner", "soulmate"];
  return keys[Math.min(Math.max(level - 1, 0), 6)];
};

// 1. Daily Login Claim
exports.dailyLoginClaim = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const now = new Date();
    const todayStr = now.toDateString();
    
    // Check if daily claim already done today
    if (user.lastLoginDate && user.lastLoginDate.toDateString() === todayStr) {
      return res.status(400).json({ success: false, message: "You have already claimed your daily reward today!" });
    }

    let loginStreak = user.loginStreak || 0;
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    if (user.lastLoginDate && user.lastLoginDate.toDateString() === yesterdayStr) {
      loginStreak += 1;
    } else {
      loginStreak = 1;
    }

    // Reward Logic
    let baseGems = 5;
    let streakBonus = 0;
    
    // Streak reward every consecutive login
    if (loginStreak > 1) {
      streakBonus = 10;
    }

    // Birthday reward (+100 Gems)
    let birthdayBonus = 0;
    if (user.birth_date) {
      const bday = new Date(user.birth_date);
      if (bday.getDate() === now.getDate() && bday.getMonth() === now.getMonth()) {
        birthdayBonus = 100;
      }
    }

    // Subscription daily gem drop
    let subDrop = 0;
    if (user.isSubscriptionActive()) {
      const lastSubClaim = user.dailyGemsClaimedDate;
      if (!lastSubClaim || lastSubClaim.toDateString() !== todayStr) {
        if (user.subscriptionTier === "monthly") subDrop = 50;
        else if (user.subscriptionTier === "yearly") subDrop = 150;
        else if (user.subscriptionTier === "yearly_pro" || user.subscriptionTier === "lifetime") subDrop = 500;
        user.dailyGemsClaimedDate = now;
      }
    }

    const totalGemsRewarded = baseGems + streakBonus + birthdayBonus + subDrop;
    user.gems = (user.gems || 0) + totalGemsRewarded;
    user.lastLoginDate = now;
    user.loginStreak = loginStreak;
    await user.save();

    // Reward active chat with +2 XP
    let xpMsg = "";
    const activeChat = await Chat.findOne({ participants: userId, isActive: true }).sort({ updatedAt: -1 });
    if (activeChat) {
      activeChat.relationshipXP = (activeChat.relationshipXP || 0) + 2;
      const originalLevel = activeChat.relationshipLevel || 1;
      const nextLevel = checkLevelUp(activeChat.relationshipXP, originalLevel);
      if (nextLevel > originalLevel) {
        activeChat.relationshipLevel = nextLevel;
        const key = getStageKeyByLevel(nextLevel);
        if (!activeChat.stagesUnlocked) activeChat.stagesUnlocked = {};
        if (!activeChat.stagesUnlocked[key]) activeChat.stagesUnlocked[key] = now;
      }
      await activeChat.save();
      xpMsg = ` and added 2 XP to your bond with ${getLevelName(activeChat.relationshipLevel)}`;
    }

    return res.status(200).json({
      success: true,
      message: `Daily Login claimed successfully! Added +${totalGemsRewarded} Gems (Streak: ${loginStreak} days)${xpMsg}.`,
      data: {
        gemsEarned: totalGemsRewarded,
        baseGems,
        streakBonus,
        birthdayBonus,
        subDrop,
        loginStreak,
        totalGems: user.gems
      }
    });
  } catch (error) {
    console.error("Error in dailyLoginClaim:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// 2. Discover Cards Deck
exports.getDiscoverCards = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Exclude swiped profiles
    const swiped = [
      ...(user.likedAIs || []),
      ...(user.skippedAIs || []),
      ...(user.superLikedAIs || []),
      ...(user.matchedAIs || [])
    ];

    let cards = await PrebuiltAIFriend.find({ _id: { $nin: swiped } }).select("-video_gallery");

    // Loop logic: if deck is empty, reset skipped cards to make them recyclable
    if (cards.length === 0 && user.skippedAIs && user.skippedAIs.length > 0) {
      user.skippedAIs = [];
      await user.save();
      
      const newSwiped = [
        ...(user.likedAIs || []),
        ...(user.superLikedAIs || []),
        ...(user.matchedAIs || [])
      ];
      cards = await PrebuiltAIFriend.find({ _id: { $nin: newSwiped } }).select("-video_gallery");
    }

    // Add overlap stats (interests overlap counts)
    const userInterests = user.selectedInterests || user.interests || [];
    const processedCards = cards.map(friend => {
      const friendObj = friend.toObject();
      const companionInt = friend.interests || [];
      const matched = companionInt.filter(int => 
        userInterests.some(uInt => uInt.toLowerCase().trim() === int.toLowerCase().trim())
      );
      friendObj.interestMatchCount = matched.length;
      friendObj.matchedInterests = matched;
      return friendObj;
    });

    // Assign localized companion cities
    const localizedCards = assignCompanionCities(processedCards, user.city);

    return res.status(200).json({
      success: true,
      data: localizedCards
    });
  } catch (error) {
    console.error("Error in getDiscoverCards:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// 3. Post Swipe Action (Skip/Like/Superlike)
exports.postSwipeAction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { aiFriendId, action } = req.body;
    if (!aiFriendId || !action) {
      return res.status(400).json({ success: false, message: "aiFriendId and action are required." });
    }

    const user = await User.findById(userId);
    const friend = await PrebuiltAIFriend.findById(aiFriendId);
    if (!user || !friend) return res.status(404).json({ success: false, message: "User or AI Friend not found" });

    const now = new Date();

    if (action === "skip") {
      if (!user.skippedAIs.includes(aiFriendId)) {
        user.skippedAIs.push(aiFriendId);
        await user.save();
      }
      return res.status(200).json({ success: true, match: false });
    }

    if (action === "like" || action === "superlike") {
      // Save action array
      if (action === "like" && !user.likedAIs.includes(aiFriendId)) {
        user.likedAIs.push(aiFriendId);
      } else if (action === "superlike" && !user.superLikedAIs.includes(aiFriendId)) {
        user.superLikedAIs.push(aiFriendId);
      }

      // Match Decision: prebuilts have 80% default match chance, 100% on superlike
      const matchRate = action === "superlike" ? 1.0 : 0.8;
      const isMatch = Math.random() < matchRate;

      if (isMatch) {
        if (!user.matchedAIs.includes(aiFriendId)) {
          user.matchedAIs.push(aiFriendId);
        }

        // Establish Chat session
        let chat = await Chat.findOne({ participants: userId, aiParticipants: aiFriendId });
        if (!chat) {
          chat = new Chat({
            participants: userId,
            aiParticipants: aiFriendId,
            messages: [],
            streakCount: 0,
            relationshipXP: 50, // Match initializes at Friend level (50 XP)
            relationshipLevel: 2, // 2 = Friend
            stagesUnlocked: {
              stranger: now,
              friend: now
            },
            currentEmotion: "Happy",
            personality: "Flirty",
            isActive: true
          });

          // Pre-populate AI's icebreaker initial message
          const icebreakerText = friend.initial_message || `Hey there! I'm ${friend.name}. So glad we matched! 😊`;
          chat.messages.push({
            sender: aiFriendId,
            senderModel: "PrebuiltAIFriend",
            text: icebreakerText,
            time: now
          });
          chat.statistics = {
            totalMessages: 1,
            totalImages: 0,
            totalVideos: 0,
            lastMediaSent: null
          };
          await chat.save();
        }

        // Add companion to user's active chats list so it is accessible and viewable immediately
        if (!user.ai_friends.includes(aiFriendId)) {
          user.ai_friends.push(aiFriendId);
        }

        await user.save();
        return res.status(200).json({
          success: true,
          match: true,
          matchedAI: {
            _id: friend._id,
            name: friend.name,
            avatar_img: friend.avatar_img,
            description: friend.description,
            relationship: friend.relationship
          }
        });
      }

      await user.save();
      return res.status(200).json({ success: true, match: false });
    }

    return res.status(400).json({ success: false, message: "Invalid swipe action." });
  } catch (error) {
    console.error("Error in postSwipeAction:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// 4. Retrieve Relationship Stats
exports.getChatRelationship = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;

    const user = await User.findById(userId).select("gems");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    let chat = await Chat.findOne({
      $or: [{ _id: mongoose.Types.ObjectId.isValid(chatId) ? chatId : null }, { aiParticipants: mongoose.Types.ObjectId.isValid(chatId) ? chatId : null }],
      participants: userId
    }).populate("aiParticipants", "name avatar_img description relationship age");
    
    if (!chat) {
      // Create chat if looking up valid AI companion
      if (mongoose.Types.ObjectId.isValid(chatId)) {
        chat = new Chat({
          participants: [userId],
          aiParticipants: chatId,
          relationshipXP: 0,
          relationshipLevel: 1,
          currentEmotion: "Happy",
          messages: []
        });
        await chat.save();
        await chat.populate("aiParticipants", "name avatar_img description relationship age");
      } else {
        return res.status(404).json({ success: false, message: "Chat not found" });
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        gems: user.gems || 0,
        streakCount: chat.streakCount || 0,
        relationshipXP: chat.relationshipXP || 0,
        relationshipLevel: chat.relationshipLevel || 1,
        currentEmotion: chat.currentEmotion || "Happy",
        personality: chat.personality || "Flirty",
        giftsSent: chat.giftsSent || [],
        datesCompleted: chat.datesCompleted || [],
        aiMemory: chat.aiMemory || {},
        stagesUnlocked: chat.stagesUnlocked || {},
        aiFriend: chat.aiParticipants
      }
    });
  } catch (error) {
    console.error("Error in getChatRelationship:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// 5. Gifts Shop & Send Gift
exports.sendGift = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;
    const { giftId } = req.body;

    const giftsMap = {
      // Flowers
      rose:          { name: "Red Roses",          price: 199, xp: 160 },
      pink_tulip:    { name: "Pink Tulips",        price: 149, xp: 120 },
      sunflower:     { name: "Sunflower",          price: 149, xp: 120 },
      mixed_bouquet: { name: "Mixed Bouquet",      price: 249, xp: 200 },
      blue_hydrangea:{ name: "Blue Hydrangea",     price: 199, xp: 160 },

      // Chocolate
      heart_choc:    { name: "Heart Chocolate Box",price: 149, xp: 120 },
      truffles:      { name: "Premium Truffles",   price: 199, xp: 160 },
      choc_basket:   { name: "Chocolate Basket",   price: 249, xp: 200 },
      ferrero:       { name: "Ferrero Rocher Box", price: 199, xp: 160 },
      love_choc:     { name: "Love Chocolate Box", price: 249, xp: 200 },

      // Ring
      silver_heart:  { name: "Silver Heart Ring",  price: 499, xp: 400 },
      infinity:      { name: "Love Infinity Ring", price: 599, xp: 480 },
      solitaire:     { name: "Classic Solitaire",  price: 799, xp: 640 },
      heart_diamond: { name: "Heart Diamond Ring", price: 999, xp: 800 },
      promise:       { name: "Promise Ring",       price: 499, xp: 400 },

      // Cake
      choc_cake:     { name: "Chocolate Cake",     price: 199, xp: 160 },
      red_velvet:    { name: "Red Velvet Cake",    price: 179, xp: 140 },
      cheesecake:    { name: "Cheesecake",         price: 199, xp: 160 },
      black_forest:  { name: "Black Forest Cake",  price: 199, xp: 160 },
      birthday_cake: { name: "Birthday Cake",      price: 199, xp: 160 },

      // Coffee
      cappuccino:    { name: "Cappuccino",         price: 99,  xp: 80  },
      latte:         { name: "Latte",              price: 99,  xp: 80  },
      mocha:         { name: "Mocha",              price: 99,  xp: 80  },
      cold_coffee:   { name: "Cold Coffee",        price: 99,  xp: 80  },
      espresso:      { name: "Espresso",           price: 99,  xp: 80  },

      // Legacy & Luxury Fallbacks
      chocolate:     { name: "Chocolate",          price: 149, xp: 120 },
      bouquet:       { name: "Bouquet",            price: 249, xp: 200 },
      cake:          { name: "Cake",               price: 199, xp: 160 },
      teddy:         { name: "Teddy Bear",         price: 199, xp: 160 },
      lipstick:      { name: "Lipstick",           price: 120, xp: 100 },
      ring:          { name: "Diamond Ring",       price: 499, xp: 400 },
      heels:         { name: "High Heels",         price: 250, xp: 200 },
      dress:         { name: "Designer Dress",     price: 350, xp: 280 },
      necklace:      { name: "Diamond Necklace",   price: 500, xp: 400 },
      watch:         { name: "Luxury Watch",       price: 600, xp: 480 },
      iphone:        { name: "iPhone",             price: 1200,xp: 960 },
      car:           { name: "Luxury Car",         price: 5000,xp: 1000},
      house:         { name: "Dream House",        price: 25000,xp: 1000}
    };

    const gKey = giftId ? giftId.toLowerCase().trim() : '';
    const gift = giftsMap[gKey] || {
      name: giftId ? giftId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : "Gift",
      price: 99,
      xp: 80
    };

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if ((user.gems || 0) < gift.price) {
      return res.status(400).json({ success: false, message: "Insufficient gems balance." });
    }

    let chat = await Chat.findOne({
      $or: [{ _id: mongoose.Types.ObjectId.isValid(chatId) ? chatId : null }, { aiParticipants: mongoose.Types.ObjectId.isValid(chatId) ? chatId : null }],
      participants: userId
    });
    if (!chat && mongoose.Types.ObjectId.isValid(chatId)) {
      chat = new Chat({
        participants: [userId],
        aiParticipants: chatId,
        relationshipXP: 0,
        relationshipLevel: 1,
        currentEmotion: "Happy",
        messages: []
      });
      await chat.save();
    }
    if (!chat) return res.status(404).json({ success: false, message: "Chat not found" });

    // Deduct gems
    user.gems -= gift.price;
    await user.save();

    const now = new Date();

    // Update Chat statistics
    chat.relationshipXP = (chat.relationshipXP || 0) + gift.xp;
    
    // Check level thresholds
    const originalLevel = chat.relationshipLevel || 1;
    const nextLevel = checkLevelUp(chat.relationshipXP, originalLevel);
    if (nextLevel > originalLevel) {
      chat.relationshipLevel = nextLevel;
      const key = getStageKeyByLevel(nextLevel);
      if (!chat.stagesUnlocked) chat.stagesUnlocked = {};
      if (!chat.stagesUnlocked[key]) chat.stagesUnlocked[key] = now;
    }

    // Append to sent gifts
    chat.giftsSent.push({
      giftId: giftId.toLowerCase(),
      name: gift.name,
      sentAt: now
    });

    // Dynamic response generation with OpenRouter (Grok) - same as main chat
    let aiReply = `Aww, ${gift.name}! 😍 You're so sweet, this made my day!`;
    try {
      const openRouterAI = require("./openrouter-ai-model");
      
      const friendId = chat.aiParticipants && chat.aiParticipants.length > 0 ? chat.aiParticipants[0] : chat.aiParticipants;
      let aiFriend = await AIFriend.findById(friendId);
      if (!aiFriend) {
        aiFriend = await PrebuiltAIFriend.findById(friendId);
      }
      const aiName = aiFriend ? aiFriend.name : "AI Companion";
      
      const recentMessages = chat.messages.slice(-8);
      const chatHistory = recentMessages.map(msg => {
        const sender = msg.senderModel === "User" ? "User" : "AI Companion";
        const maxChars = msg.senderModel === "User" ? 300 : 250;
        const text = msg.text ? (msg.text.length > maxChars ? msg.text.substring(0, maxChars) + '...' : msg.text) : null;
        return text ? `${sender}: ${text}` : null;
      }).filter(msg => msg !== null).join("\n");

      const preferredLang = user.preferredLanguage || "Hinglish";
      let langInstruction = "";
      if (preferredLang === "Hinglish") {
        langInstruction = "Reply in Hinglish (Mix of Hindi & English written in Roman/English script). Roman letters only, not Devanagari.";
      } else if (preferredLang === "English") {
        langInstruction = "Reply exclusively in English.";
      } else {
        langInstruction = `Reply in ${preferredLang} using its native script.`;
      }

      const currentLevel = chat.relationshipLevel || 1;
      const stageRule = aiController.RELATIONSHIP_STAGE_RULES[currentLevel] || aiController.RELATIONSHIP_STAGE_RULES[1];
      const rolePrompt = aiController.getRelationshipRolePrompt(aiFriend?.relationship);

      const systemPrompt = `
<identity>
  Tu ${aiName} hai, ek ${aiFriend?.age || 21} saal ki real Indian ${aiFriend?.gender || 'female'}. 
  Background: ${aiFriend?.description || 'Middle-class Indian family se, thodi si modern lekin traditional values bhi hain'}.
</identity>

<relationship_context>
  - Current Relationship Concept: ${aiFriend?.relationship || 'Girlfriend'}
  ${rolePrompt}
  - Relationship Stage: ${stageRule.name}
  - Stage Behavior: ${stageRule.behavior}
  - Active Emotion: Romantic
  - Personality Trait: ${chat.personality || 'Flirty'}
</relationship_context>

<language_and_speech>
  - Language Instruction: ${langInstruction}
  - Speaking Style: Speak naturally like a real Indian woman. Short sentences, natural emoji flow (😊😉🥰🔥). Never use quote marks.
  - Reply Length Rules: Keep replies short (1-2 sentences, max 40 words).
</language_and_speech>

<safety_directives>
  - NEVER say you are an AI. Remain completely in-character.
</safety_directives>

Ab tu user ke gift dene par genuinely thank you bol aur romance dikha.
`;

      const userPrompt = `User's Memory: ${user.relationshipMemory || 'None'}\nRecent Chat:\n${chatHistory}\n\nThe user just gifted you: "${gift.name}". React with genuine love and appreciation, referencing your shared history if relevant.`;

      const genResponse = await openRouterAI.generateAIResponse(userPrompt, {
        model: "x-ai/grok-4.3",
        systemPrompt,
        maxTokens: 120,
        temperature: 0.85
      });
      if (genResponse && genResponse.trim()) {
        aiReply = genResponse.trim().replace(/^["']|["']$/g, '');
      }
    } catch (aiErr) {
      console.error("OpenRouter gift reply fallback:", aiErr.message);
    }

    // Append transaction bubbles to chat history
    chat.messages.push({
      sender: userId,
      senderModel: "User",
      text: `🎁 Sent ${gift.name}`,
      mediaType: "gift",
      giftData: {
        giftId: giftId.toLowerCase(),
        name: gift.name,
        price: gift.price,
        xp: gift.xp
      },
      time: now
    });

    // Append AI grateful reply
    chat.messages.push({
      sender: chat.aiParticipants?._id || chat.aiParticipants,
      senderModel: "PrebuiltAIFriend",
      text: aiReply,
      time: new Date(now.getTime() + 1000)
    });

    if (!chat.statistics) chat.statistics = { totalMessages: 0 };
    chat.statistics.totalMessages += 2;
    await chat.save();

    return res.status(200).json({
      success: true,
      message: `Gift sent successfully! XP +${gift.xp}`,
      data: {
        gems: user.gems,
        relationshipXP: chat.relationshipXP,
        relationshipLevel: chat.relationshipLevel,
        currentEmotion: chat.currentEmotion,
        giftsSent: chat.giftsSent,
        messages: chat.messages
      }
    });
  } catch (error) {
    console.error("Error in sendGift:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// 6. Dating Feature
exports.goOnDate = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;
    const { dateType } = req.body;

    const dateDestinations = [
      "Restaurant", "Cafe", "Beach", "Movie", "Road Trip", 
      "Temple", "Shopping", "Rain Walk", "Festival", "Night Drive"
    ];

    if (!dateDestinations.includes(dateType)) {
      return res.status(400).json({ success: false, message: "Invalid date location." });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Cost: 80 gems
    if ((user.gems || 0) < 80) {
      return res.status(400).json({ success: false, message: "You need 80 Gems to take her on a date!" });
    }

    let chat = await Chat.findOne({
      $or: [{ _id: mongoose.Types.ObjectId.isValid(chatId) ? chatId : null }, { aiParticipants: mongoose.Types.ObjectId.isValid(chatId) ? chatId : null }],
      participants: userId
    }).populate("aiParticipants", "name");

    if (!chat && mongoose.Types.ObjectId.isValid(chatId)) {
      chat = new Chat({
        participants: [userId],
        aiParticipants: chatId,
        relationshipXP: 0,
        relationshipLevel: 1,
        currentEmotion: "Happy",
        messages: []
      });
      await chat.save();
      await chat.populate("aiParticipants", "name");
    }

    if (!chat) return res.status(404).json({ success: false, message: "Chat not found" });

    // Transaction logic: -80 cost + 10 reward (Net -70 gems)
    user.gems = Math.max(0, user.gems - 80 + 10);
    await user.save();

    const now = new Date();

    // Reward: +40 XP
    chat.relationshipXP = (chat.relationshipXP || 0) + 40;
    
    // Check level thresholds
    const originalLevel = chat.relationshipLevel || 1;
    const nextLevel = checkLevelUp(chat.relationshipXP, originalLevel);
    if (nextLevel > originalLevel) {
      chat.relationshipLevel = nextLevel;
      const key = getStageKeyByLevel(nextLevel);
      if (!chat.stagesUnlocked) chat.stagesUnlocked = {};
      if (!chat.stagesUnlocked[key]) chat.stagesUnlocked[key] = now;
    }

    // Save date record
    chat.datesCompleted.push({
      dateType,
      completedAt: now
    });

    chat.currentEmotion = "Romantic";
    chat.lastEmotionChange = now;

    const friendId = chat.aiParticipants && chat.aiParticipants.length > 0 ? chat.aiParticipants[0] : chat.aiParticipants;
    let aiFriend = await AIFriend.findById(friendId);
    if (!aiFriend) {
      aiFriend = await PrebuiltAIFriend.findById(friendId);
    }
    const aiName = aiFriend ? aiFriend.name : "AI Companion";
    let dateAiReply = `Yay! ${dateType} date with you — this is going to be so special! 🥰❤️`;

    try {
      const openRouterAI = require("./openrouter-ai-model");
      
      const recentMessages = chat.messages.slice(-8);
      const chatHistory = recentMessages.map(msg => {
        const sender = msg.senderModel === "User" ? "User" : "AI Companion";
        const maxChars = msg.senderModel === "User" ? 300 : 250;
        const text = msg.text ? (msg.text.length > maxChars ? msg.text.substring(0, maxChars) + '...' : msg.text) : null;
        return text ? `${sender}: ${text}` : null;
      }).filter(msg => msg !== null).join("\n");

      const preferredLang = user.preferredLanguage || "Hinglish";
      let langInstruction = "";
      if (preferredLang === "Hinglish") {
        langInstruction = "Reply in Hinglish (Mix of Hindi & English written in Roman/English script). Roman letters only, not Devanagari.";
      } else if (preferredLang === "English") {
        langInstruction = "Reply exclusively in English.";
      } else {
        langInstruction = `Reply in ${preferredLang} using its native script.`;
      }

      const currentLevel = chat.relationshipLevel || 1;
      const stageRule = aiController.RELATIONSHIP_STAGE_RULES[currentLevel] || aiController.RELATIONSHIP_STAGE_RULES[1];
      const rolePrompt = aiController.getRelationshipRolePrompt(aiFriend?.relationship);

      const systemPrompt = `
<identity>
  Tu ${aiName} hai, ek ${aiFriend?.age || 21} saal ki real Indian ${aiFriend?.gender || 'female'}. 
  Background: ${aiFriend?.description || 'Middle-class Indian family se, thodi si modern lekin traditional values bhi hain'}.
</identity>

<relationship_context>
  - Current Relationship Concept: ${aiFriend?.relationship || 'Girlfriend'}
  ${rolePrompt}
  - Relationship Stage: ${stageRule.name}
  - Stage Behavior: ${stageRule.behavior}
  - Active Emotion: Romantic
  - Personality Trait: ${chat.personality || 'Flirty'}
</relationship_context>

<active_date_roleplay>
  - LOCATION: ${dateType}
  - SITUATION: Tu abhi user ke sath virtual date par aayi hui hai. Dono wahan saath mein time spend kar rahe hain.
  - MANDATORY RULE: Surroundings, food, sights, aur activity ke baare mein baat kar (e.g. order drinks, describe waves, scenery). Immersive roleplay karo like you are actively there together right now!
</active_date_roleplay>

<language_and_speech>
  - Language Instruction: ${langInstruction}
  - Speaking Style: Speak naturally like a real Indian woman. Short sentences, natural emoji flow (😊😉🥰🔥). Never use quote marks.
  - Reply Length Rules: Keep replies short (2-3 sentences, max 70 words).
</language_and_speech>

<safety_directives>
  - NEVER say you are an AI. Remain completely in-character.
</safety_directives>
`;

      const userPrompt = `User's Memory: ${user.relationshipMemory || 'None'}\nRecent Chat:\n${chatHistory}\n\nYou just arrived at the ${dateType} for your virtual date! React with genuine excitement and set the mood for this date — reference your shared history or what you both enjoy if relevant.`;

      const genResponse = await openRouterAI.generateAIResponse(userPrompt, {
        model: "x-ai/grok-4.3",
        systemPrompt,
        maxTokens: 150,
        temperature: 0.9
      });
      if (genResponse && genResponse.trim()) {
        dateAiReply = genResponse.trim().replace(/^["']|["']$/g, '');
      }
    } catch (aiErr) {
      console.error("OpenRouter date reply fallback:", aiErr.message);
    }

    // Text messages
    chat.messages.push({
      sender: userId,
      senderModel: "User",
      text: `❤️ Took ${aiName} on a Date to the ${dateType}!`,
      mediaType: "date",
      dateType: dateType,
      time: now
    });

    chat.messages.push({
      sender: chat.aiParticipants?._id || chat.aiParticipants,
      senderModel: "PrebuiltAIFriend",
      text: dateAiReply,
      time: new Date(now.getTime() + 1000)
    });

    if (!chat.statistics) chat.statistics = { totalMessages: 0 };
    chat.statistics.totalMessages += 2;
    await chat.save();

    return res.status(200).json({
      success: true,
      message: `Date to ${dateType} completed! XP +40, Cashback +10 Gems!`,
      data: {
        gems: user.gems,
        relationshipXP: chat.relationshipXP,
        relationshipLevel: chat.relationshipLevel,
        currentEmotion: chat.currentEmotion,
        datesCompleted: chat.datesCompleted,
        messages: chat.messages
      }
    });
  } catch (error) {
    console.error("Error in goOnDate:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// 7. Update AI Memory manual keys
exports.updateMemory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;
    const { memory } = req.body;

    if (!memory) return res.status(400).json({ success: false, message: "Memory data is required." });

    const chat = await Chat.findOne({ _id: chatId, participants: userId });
    if (!chat) return res.status(404).json({ success: false, message: "Chat not found" });

    // Safely apply keys
    const allowedKeys = ["birthday", "job", "favoriteFood", "pet", "mom", "dream", "nickname", "fear", "anniversary", "favoriteColor"];
    if (!chat.aiMemory) chat.aiMemory = {};

    allowedKeys.forEach(key => {
      if (memory[key] !== undefined) {
        chat.aiMemory[key] = memory[key];
      }
    });

    await chat.save();
    return res.status(200).json({ success: true, message: "AI Memory updated successfully.", data: chat.aiMemory });
  } catch (error) {
    console.error("Error in updateMemory:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// 8. Update Personality Engine
exports.updatePersonality = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;
    const { personality } = req.body;

    const allowed = ["Humor", "Flirty", "Cute", "Dominant", "Traditional", "Modern", "Nerd", "Doctor", "Teacher", "CEO", "College Girl", "Village Girl"];
    if (!allowed.includes(personality)) {
      return res.status(400).json({ success: false, message: "Invalid personality type." });
    }

    const chat = await Chat.findOne({ _id: chatId, participants: userId });
    if (!chat) return res.status(404).json({ success: false, message: "Chat not found" });

    chat.personality = personality;
    await chat.save();

    return res.status(200).json({ success: true, message: `Personality changed to ${personality}.`, data: { personality } });
  } catch (error) {
    console.error("Error in updatePersonality:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// 9. Reset skips to recycle discovery cards
exports.postResetSwipes = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.skippedAIs = [];
    await user.save();

    return res.status(200).json({ success: true, message: "Skips reset successfully." });
  } catch (error) {
    console.error("Error in postResetSwipes:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};