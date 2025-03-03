const mongoose = require("mongoose");

const loginDetailSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  platform: { type: String },
  coordinates: { 
    lat: Number, 
    lon: Number 
  },
  ip: { type: String },
  time: { type: Date, default: Date.now },
 location: { type: String },
});

const LoginDetail = mongoose.model("LoginDetail", loginDetailSchema);
module.exports = LoginDetail;
