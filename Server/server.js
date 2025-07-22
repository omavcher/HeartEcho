const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const axios = require('axios');

dotenv.config();
connectDB();

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));


const FRONTEND = process.env.FRONTEND || "https://www.heartecho.in";

app.use(cors({
  origin: FRONTEND,  
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Allow cookies and authentication headers
}));



// Website reload configuration
const url = 'https://heartecho.onrender.com';
const interval = 90000;

function reloadWebsite() {
  axios
    .get(url)
    .then((response) => {
      console.log("website reloaded");
    })
    .catch((error) => {
      console.error(`Error: ${error.message}`);
    });
}

setInterval(reloadWebsite, interval);



app.use(express.json());

// Default API Route
app.get("/api", (req, res) => {
  res.json({      success: true,
    message: "Welcome to the HeartEcho 💘💝 API! 🚀",
    version: "1.5.7",
  });
});

// Routes
app.use("/api/v1/api/auth", require("./routes/authRoutes"));
app.use("/api/v1/api/user", require("./routes/userRoutes"));
app.use("/api/v1/api/ai", require("./routes/aiRoutes"));
app.use("/api/v1/api/admin", require("./routes/adminRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
