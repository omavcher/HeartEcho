const jwt = require("jsonwebtoken");

const cookieAuthMiddleware = (req, res, next) => {
    const authHeader = req.header("Authorization");
      const token = req.cookies.token; // Get token from cookie

    if (!token) {   
        return res.status(401).json({ msg: "No token, authorization denied" });
    }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded);
    req.user = decoded; // Attach decoded user info to request object
    next();
  } catch (error) {
    res.status(401).json({msg: "Please login to continue" });
  }
};

module.exports = cookieAuthMiddleware;
