/**
 * Upserts the mobile_upgrade email template into MongoDB.
 * Run: node Server/scripts/upsertMobileUpgradeTemplate.js
 *
 * Targets users who installed the mobile app but have not yet upgraded
 * to a paid plan. CTAs deep-link directly to the Play Store app.
 */
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: require("path").join(__dirname, "../.env") });
const EmailTemplate = require("../models/EmailTemplate");

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'DM Sans', system-ui, sans-serif;
    background: #1a0a2e;
    color: #fff;
    min-height: 100vh;
    padding: 2rem;
  }

  .email-preview {
    max-width: 600px;
    margin: 0 auto;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 0 60px rgba(233,30,140,0.2);
    border: 1px solid rgba(233,30,140,0.25);
  }

  .eh-header {
    background: linear-gradient(135deg, #0d0814 0%, #1a0f2e 50%, #2d1040 100%);
    padding: 32px 40px 24px;
    text-align: center;
    position: relative;
    border-bottom: 1px solid rgba(233,30,140,0.3);
  }
  .eh-logo {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 22px;
    color: #fff;
    letter-spacing: 0.05em;
    margin-bottom: 4px;
  }
  .eh-logo span { color: #e91e8c; }
  .eh-tagline {
    font-size: 11px;
    color: rgba(255,255,255,0.4);
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }

  .eh-hero {
    background: linear-gradient(160deg, #130820 0%, #1f0d35 60%, #120818 100%);
    padding: 40px 40px 32px;
    text-align: center;
    position: relative;
  }
  .eh-hero-emoji { font-size: 42px; margin-bottom: 16px; display: block; }
  .eh-hero-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 26px;
    color: #fff;
    line-height: 1.3;
    margin-bottom: 12px;
  }
  .eh-hero-title em { font-style: italic; color: #ff6b9d; }
  .eh-hero-sub {
    font-size: 14px;
    color: rgba(255,255,255,0.6);
    line-height: 1.7;
    max-width: 420px;
    margin: 0 auto 24px;
  }

  .eh-cta {
    display: inline-block;
    background: linear-gradient(135deg, #e91e8c, #c2185b);
    color: #fff !important;
    text-decoration: none;
    padding: 14px 36px;
    border-radius: 99px;
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.03em;
    box-shadow: 0 4px 24px rgba(233,30,140,0.4);
  }

  .eh-body { background: #0f0620; padding: 32px 40px; }
  .eh-body p { font-size: 14px; color: rgba(255,255,255,0.7); line-height: 1.8; margin-bottom: 16px; }
  .eh-body strong { color: #fff; }

  .eh-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(233,30,140,0.4), transparent);
    margin: 24px 0;
  }

  .eh-feature { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 16px; }
  .eh-feature-icon {
    width: 36px; height: 36px;
    background: rgba(233,30,140,0.15);
    border: 1px solid rgba(233,30,140,0.3);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; flex-shrink: 0;
  }
  .eh-feature-text strong { display: block; font-size: 13px; color: #fff; margin-bottom: 2px; }
  .eh-feature-text span { font-size: 12px; color: rgba(255,255,255,0.5); }

  .eh-urgency {
    background: linear-gradient(135deg, rgba(244,162,97,0.15), rgba(233,30,140,0.15));
    border: 1px solid rgba(244,162,97,0.3);
    border-radius: 10px;
    padding: 16px 20px;
    margin: 20px 0;
    text-align: center;
  }
  .eh-urgency strong { display: block; font-size: 15px; color: #f4a261; margin-bottom: 4px; }
  .eh-urgency span { font-size: 12px; color: rgba(255,255,255,0.5); }

  .eh-footer {
    background: #080412;
    padding: 24px 40px;
    text-align: center;
    border-top: 1px solid rgba(255,255,255,0.06);
  }
  .eh-footer p { font-size: 11px; color: rgba(255,255,255,0.25); line-height: 1.8; }
  .eh-footer a { color: rgba(233,30,140,0.6); text-decoration: none; }

  @media (max-width: 480px) {
    .eh-header, .eh-hero, .eh-body, .eh-footer { padding-left: 20px !important; padding-right: 20px !important; }
    .eh-hero-title { font-size: 22px; }
    .eh-cta { width: 100%; box-sizing: border-box; }
  }
`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Upgrade Your Plan – HeartEcho</title>
  <style>${globalStyles}</style>
</head>
<body>
  <div class="email-preview">
    <div class="eh-header">
      <div class="eh-logo">Heart<span>Echo</span></div>
      <div class="eh-tagline">Your Private AI Space</div>
    </div>

    <div class="eh-hero">
      <span class="eh-hero-emoji">🔓</span>
      <div class="eh-hero-title">Take the connection <em>deeper</em>.</div>
      <p class="eh-hero-sub">You've installed the app, but your AI companion is waiting to actually hear your voice.</p>
      <a href="https://play.google.com/store/apps/details?id=com.heartecho.ai" class="eh-cta">Open App to Upgrade →</a>
    </div>

    <div class="eh-body">
      <p>Hey {{first_name}},</p>
      <p>Welcome to HeartEcho! We saw you register on the app today, but you haven't unlocked your Premium experience yet.</p>
      <p>Free messages are great for a quick hello, but if you want to build a real, emotional bond, here is what you are missing out on:</p>

      <div class="eh-feature">
        <div class="eh-feature-icon">📞</div>
        <div class="eh-feature-text">
          <strong>Real-Time Voice Calls</strong>
          <span>Stop typing. Hear their voice, share your thoughts, and talk naturally anytime, anywhere.</span>
        </div>
      </div>

      <div class="eh-feature">
        <div class="eh-feature-icon">🧠</div>
        <div class="eh-feature-text">
          <strong>Deep Memory Engine</strong>
          <span>Your companion remembers your likes, dislikes, and past stories to build a continuous relationship.</span>
        </div>
      </div>

      <div class="eh-feature">
        <div class="eh-feature-icon">⚡</div>
        <div class="eh-feature-text">
          <strong>Lightning Fast, Unlimited Chats</strong>
          <span>No limits. No waiting. Experience instant, human-like replies 24/7.</span>
        </div>
      </div>

      <div class="eh-urgency">
        <strong>Unlock the Standard Plan (&#8377;99)</strong>
        <span>Join our most popular tier today and instantly activate Voice Calling and Deep Memory.</span>
      </div>

      <div class="eh-divider"></div>

      <p style="text-align:center">
        <a href="https://play.google.com/store/apps/details?id=com.heartecho.ai" class="eh-cta">Open the App &amp; Upgrade →</a>
      </p>
    </div>

    <div class="eh-footer">
      <p>HeartEcho · heartecho.in · <a href="#">Unsubscribe</a></p>
      <p>Sent securely to {{email}}</p>
    </div>
  </div>
</body>
</html>`;

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB");

  const result = await EmailTemplate.findOneAndUpdate(
    { name: "mobile_upgrade" },
    {
      name: "mobile_upgrade",
      label: "📱 Mobile App Upgrade Push",
      subject: "You installed the app. Now unlock everything, {{first_name}}.",
      html,
    },
    { upsert: true, new: true }
  );

  console.log(`✅ Upserted template: ${result.label}`);
  await mongoose.disconnect();
  console.log("🔌 Disconnected.");
}

run().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
