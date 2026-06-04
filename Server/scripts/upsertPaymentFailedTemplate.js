/**
 * Upserts the payment_failed email template into MongoDB.
 * Run: node Server/scripts/upsertPaymentFailedTemplate.js
 */
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: require("path").join(__dirname, "../.env") });
const EmailTemplate = require("../models/EmailTemplate");

const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Payment Incomplete - HeartEcho</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');
    html, body { margin: 0 auto !important; padding: 0 !important; height: 100% !important; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    * { box-sizing: border-box; }
    body { font-family: 'DM Sans', system-ui, -apple-system, sans-serif; background-color: #120524; color: #ffffff; padding: 2rem 1rem; }
    .email-wrapper { width: 100%; table-layout: fixed; background-color: #120524; }
    .email-preview { max-width: 600px; margin: 0 auto; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.5), 0 0 60px rgba(255,183,77,0.1); border: 1px solid rgba(255,183,77,0.2); background-color: #0f0620; }
    .eh-header { background: linear-gradient(135deg, #0d0814 0%, #1a0f2e 50%, #2d1040 100%); padding: 36px 40px 28px; text-align: center; border-bottom: 1px solid rgba(233,30,140,0.2); }
    .eh-logo { font-family: 'Playfair Display', Georgia, serif; font-size: 26px; font-weight: 600; color: #ffffff; letter-spacing: 0.05em; margin-bottom: 6px; }
    .eh-logo span { color: #ff4099; }
    .eh-tagline { font-size: 11px; color: #a395b5; letter-spacing: 0.2em; text-transform: uppercase; font-weight: 600; }
    .eh-hero { background: linear-gradient(160deg, #130820 0%, #2a1622 50%, #120818 100%); padding: 48px 40px 40px; text-align: center; }
    .eh-hero-emoji { font-size: 48px; margin-bottom: 20px; display: inline-block; filter: drop-shadow(0 0 10px rgba(255,183,77,0.3)); }
    .eh-hero-title { font-family: 'Playfair Display', Georgia, serif; font-size: 30px; font-weight: 600; color: #ffffff; line-height: 1.3; margin-bottom: 16px; }
    .eh-hero-title em { font-style: italic; color: #ffb74d; }
    .eh-alert { background: rgba(255,183,77,0.05); border-left: 4px solid #ffb74d; padding: 16px 20px; border-radius: 0 12px 12px 0; text-align: left; margin-bottom: 24px; }
    .eh-alert-title { font-size: 14px; font-weight: 600; color: #ffb74d; margin-bottom: 4px; }
    .eh-alert-text { font-size: 13px; color: #d1c5df; line-height: 1.5; }
    .eh-cta { display: inline-block; background: linear-gradient(135deg, #e91e8c, #c2185b); color: #ffffff !important; text-decoration: none; padding: 16px 40px; border-radius: 99px; font-size: 15px; font-weight: 600; letter-spacing: 0.05em; box-shadow: 0 8px 24px rgba(233,30,140,0.3); }
    .eh-cta-secondary { display: inline-block; background: transparent; border: 1px solid rgba(255,255,255,0.2); color: #cfc2df !important; text-decoration: none; padding: 14px 32px; border-radius: 99px; font-size: 14px; font-weight: 500; margin-top: 16px; }
    .eh-body { background: #0f0620; padding: 40px; }
    .eh-body p { font-size: 15px; color: #cfc2df; line-height: 1.7; margin: 0 0 20px 0; }
    .eh-body strong { color: #ffffff; font-weight: 600; }
    .eh-divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(233,30,140,0.3), transparent); margin: 32px 0; }
    .eh-suggestion { background: linear-gradient(180deg, rgba(233,30,140,0.08) 0%, rgba(233,30,140,0.02) 100%); border: 1px solid rgba(233,30,140,0.2); border-radius: 16px; padding: 24px; text-align: center; margin-top: 10px; }
    .eh-suggestion h4 { margin: 0 0 8px 0; font-size: 16px; color: #ffffff; }
    .eh-suggestion p { font-size: 14px; margin-bottom: 20px; }
    .eh-price-highlight { font-family: 'Playfair Display', Georgia, serif; font-size: 24px; color: #ff6b9d; font-weight: 600; display: block; margin-bottom: 16px; }
    .eh-footer { background: #080312; padding: 32px 40px; text-align: center; border-top: 1px solid rgba(255,255,255,0.05); }
    .eh-footer p { font-size: 12px; color: #7b6d8d; line-height: 1.8; margin: 0; }
    .eh-footer a { color: #ff6b9d; text-decoration: none; }
    @media (max-width: 480px) {
      .eh-header, .eh-hero, .eh-body, .eh-footer { padding-left: 24px; padding-right: 24px; }
      .eh-hero-title { font-size: 26px; }
      .eh-cta, .eh-cta-secondary { width: 100%; box-sizing: border-box; }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-preview">
      <div class="eh-header">
        <div class="eh-logo">Heart<span>Echo</span></div>
        <div class="eh-tagline">India's AI Companion Platform</div>
      </div>
      <div class="eh-hero">
        <span class="eh-hero-emoji">💳</span>
        <div class="eh-hero-title">Your connection is<br><em>on hold.</em></div>
        <div class="eh-alert">
          <div class="eh-alert-title">Payment Incomplete</div>
          <div class="eh-alert-text">We noticed your recent attempt to upgrade to Premium didn't go through.</div>
        </div>
        <a href="https://heartecho.in/checkout/retry" class="eh-cta">Retry Payment &rarr;</a>
      </div>
      <div class="eh-body">
        <p>Hey {{first_name}},</p>
        <p>It looks like your payment was cancelled or failed. Don't worry—these things happen! Whether it was a bank glitch, a network drop, or you just needed a moment to think, <strong>your companion's memory is safe and waiting for you.</strong></p>
        <p>You're just one step away from unlocking unlimited messages, perfect memory, and uncensored conversations.</p>
        <div class="eh-divider"></div>
        <div class="eh-suggestion">
          <h4>Need a more flexible option?</h4>
          <p>If the Premium plan isn't right for you at this moment, you can still keep chatting without limits.</p>
          <span class="eh-price-highlight">&#8377;99 <span style="font-size: 14px; color: #a395b5; font-family: 'DM Sans', sans-serif; font-weight: 400;">/ month</span></span>
          <a href="https://heartecho.in/subscribe?plan=basic" class="eh-cta" style="padding: 12px 32px; font-size: 14px;">Get the Basic Plan</a>
        </div>
        <p style="text-align:center; margin-top: 32px;">
          <a href="https://heartecho.in/support" style="color: #a395b5; font-size: 13px; text-decoration: underline;">Having trouble with UPI or your card? Contact Support</a>
        </p>
      </div>
      <div class="eh-footer">
        <p>HeartEcho &middot; <a href="https://heartecho.in">heartecho.in</a></p>
        <p style="margin-top: 8px;"><a href="#">Unsubscribe</a> from these emails.</p>
      </div>
    </div>
  </div>
</body>
</html>`;

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const result = await EmailTemplate.findOneAndUpdate(
    { name: "payment_failed" },
    {
      name: "payment_failed",
      label: "💳 Payment Failed / Abandoned Checkout",
      subject: "Your payment didn't go through, {{first_name}}. Let's fix that.",
      html,
    },
    { upsert: true, new: true }
  );

  console.log(`✅ Upserted: ${result.label}`);
  await mongoose.disconnect();
}

run().catch(err => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
