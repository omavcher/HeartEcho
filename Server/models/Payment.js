const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rupees: { type: Number, required: true },
  transaction_id: { type: String, required: true },
  date: { type: Date, default: Date.now },
  expiry_date: { type: Date }
});

const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment;
