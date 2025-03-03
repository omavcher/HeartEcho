const mongoose = require("mongoose");

const TicketSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  issue: { type: String, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ["Pending", "Resolved"], default: "Pending" }
});

const Complaint = mongoose.model("Ticket", TicketSchema);
module.exports = Complaint;
