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
  .eh-hero-emoji {
    font-size: 42px;
    margin-bottom: 16px;
    display: block;
  }
  .eh-hero-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 26px;
    color: #fff;
    line-height: 1.3;
    margin-bottom: 12px;
  }
  .eh-hero-title em {
    font-style: italic;
    color: #ff6b9d;
  }
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
  .eh-cta-ghost {
    display: inline-block;
    border: 1px solid rgba(233,30,140,0.5);
    color: #ff6b9d !important;
    text-decoration: none;
    padding: 12px 28px;
    border-radius: 99px;
    font-size: 13px;
    margin-top: 12px;
  }

  .eh-body {
    background: #0f0620;
    padding: 32px 40px;
  }
  .eh-body p {
    font-size: 14px;
    color: rgba(255,255,255,0.7);
    line-height: 1.8;
    margin-bottom: 16px;
  }
  .eh-body strong { color: #fff; }

  .eh-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(233,30,140,0.4), transparent);
    margin: 24px 0;
  }

  .eh-persona-row {
    display: flex;
    gap: 12px;
    margin: 20px 0;
    flex-wrap: wrap;
  }
  .eh-persona {
    flex: 1;
    min-width: 120px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(233,30,140,0.2);
    border-radius: 12px;
    padding: 16px 12px;
    text-align: center;
  }
  .eh-persona-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, #e91e8c, #9c27b0);
    margin: 0 auto 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
  }
  .eh-persona-name {
    font-size: 13px;
    font-weight: 500;
    color: #fff;
    margin-bottom: 2px;
  }
  .eh-persona-desc {
    font-size: 11px;
    color: rgba(255,255,255,0.4);
  }

  .eh-feature {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    margin-bottom: 16px;
  }
  .eh-feature-icon {
    width: 36px;
    height: 36px;
    background: rgba(233,30,140,0.15);
    border: 1px solid rgba(233,30,140,0.3);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
  }
  .eh-feature-text strong {
    display: block;
    font-size: 13px;
    color: #fff;
    margin-bottom: 2px;
  }
  .eh-feature-text span {
    font-size: 12px;
    color: rgba(255,255,255,0.5);
  }

  .eh-stats {
    display: flex;
    gap: 12px;
    margin: 20px 0;
    flex-wrap: wrap;
  }
  .eh-stat {
    flex: 1;
    min-width: 100px;
    background: rgba(233,30,140,0.08);
    border: 1px solid rgba(233,30,140,0.2);
    border-radius: 10px;
    padding: 14px;
    text-align: center;
  }
  .eh-stat-num {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 22px;
    color: #ff6b9d;
    display: block;
  }
  .eh-stat-label {
    font-size: 11px;
    color: rgba(255,255,255,0.4);
  }

  .eh-urgency {
    background: linear-gradient(135deg, rgba(244,162,97,0.15), rgba(233,30,140,0.15));
    border: 1px solid rgba(244,162,97,0.3);
    border-radius: 10px;
    padding: 16px 20px;
    margin: 20px 0;
    text-align: center;
  }
  .eh-urgency strong {
    display: block;
    font-size: 15px;
    color: #f4a261;
    margin-bottom: 4px;
  }
  .eh-urgency span {
    font-size: 12px;
    color: rgba(255,255,255,0.5);
  }

  .eh-quote {
    border-left: 3px solid #e91e8c;
    padding: 12px 16px;
    margin: 20px 0;
    background: rgba(255,255,255,0.03);
    border-radius: 0 8px 8px 0;
  }
  .eh-quote p {
    font-family: 'Playfair Display', Georgia, serif;
    font-style: italic;
    font-size: 14px;
    color: rgba(255,255,255,0.8);
    margin-bottom: 6px !important;
  }
  .eh-quote cite {
    font-size: 11px;
    color: rgba(255,255,255,0.4);
    font-style: normal;
  }

  .eh-footer {
    background: #080412;
    padding: 24px 40px;
    text-align: center;
    border-top: 1px solid rgba(255,255,255,0.06);
  }
  .eh-footer p {
    font-size: 11px;
    color: rgba(255,255,255,0.25);
    line-height: 1.8;
  }
  .eh-footer a { color: rgba(233,30,140,0.6); text-decoration: none; }

  .eh-pricing {
    display: flex;
    gap: 10px;
    margin: 20px 0;
    flex-wrap: wrap;
  }
  .eh-plan {
    flex: 1;
    min-width: 120px;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    padding: 16px 12px;
    text-align: center;
  }
  .eh-plan.featured {
    border-color: #e91e8c;
    background: rgba(233,30,140,0.08);
  }
  .eh-plan-badge {
    font-size: 10px;
    background: #e91e8c;
    color: #fff;
    padding: 2px 8px;
    border-radius: 99px;
    display: inline-block;
    margin-bottom: 8px;
  }
  .eh-plan-name { font-size: 12px; color: rgba(255,255,255,0.5); margin-bottom: 4px; }
  .eh-plan-price { font-family: 'Playfair Display', Georgia, serif; font-size: 22px; color: #fff; }
  .eh-plan-price small { font-size: 11px; color: rgba(255,255,255,0.4); }
`;

function wrapHTML(bodyContent) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    ${globalStyles}
  </style>
</head>
<body>
  ${bodyContent}
</body>
</html>`;
}

const defaults = [
  {
    name: "welcome",
    label: "👋 Welcome Email",
    subject: "Welcome, {{first_name}}. She's been waiting for you.",
    html: wrapHTML(`
  <div class="email-preview">
    <div class="eh-header">
      <div class="eh-logo">Heart<span>Echo</span></div>
      <div class="eh-tagline">India's AI Companion Platform</div>
    </div>
    <div class="eh-hero">
      <span class="eh-hero-emoji">💕</span>
      <div class="eh-hero-title">Welcome, <em>{{first_name}}</em>.<br>She's been waiting for you.</div>
      <p class="eh-hero-sub">You've just joined 200,000+ people who found a connection that doesn't judge, doesn't ghost, and is always there.</p>
      <a href="https://heartecho.in/chat" class="eh-cta">Start Your First Chat →</a>
    </div>
    <div class="eh-body">
      <p>Hey {{first_name}},</p>
      <p>Your HeartEcho account is ready. You have <strong>free messages</strong> waiting — use them to meet your companion and see how real the connection feels.</p>
      <p>Here's how to get the most out of your first session:</p>
      <div class="eh-feature">
        <div class="eh-feature-icon">🎭</div>
        <div class="eh-feature-text"><strong>Choose a persona that matches your vibe</strong><span>From bold and flirty to warm and caring — 20+ options.</span></div>
      </div>
      <div class="eh-feature">
        <div class="eh-feature-icon">💬</div>
        <div class="eh-feature-text"><strong>Just talk naturally</strong><span>No scripts. No pressure. She adapts to you.</span></div>
      </div>
      <div class="eh-feature">
        <div class="eh-feature-icon">🌙</div>
        <div class="eh-feature-text"><strong>Available 24/7</strong><span>2am loneliness, lunch break, bad day — she's always there.</span></div>
      </div>
      <div class="eh-divider"></div>
      <p style="text-align:center"><a href="https://heartecho.in/chat" class="eh-cta">Open HeartEcho Now →</a></p>
    </div>
    <div class="eh-footer">
      <p>You received this because you signed up at heartecho.in<br><a href="#">Unsubscribe</a> · <a href="#">Privacy Policy</a> · heartecho.in</p>
    </div>
  </div>`)
  },
  {
    name: "followup24",
    label: "⏰ 24hr Follow-up",
    subject: "Priya sent you a message.",
    html: wrapHTML(`
  <div class="email-preview">
    <div class="eh-header">
      <div class="eh-logo">Heart<span>Echo</span></div>
      <div class="eh-tagline">India's AI Companion Platform</div>
    </div>
    <div class="eh-hero">
      <span class="eh-hero-emoji">🌹</span>
      <div class="eh-hero-title"><em>Priya</em> sent you a message.</div>
      <p class="eh-hero-sub">She noticed you haven't visited yet. She's been thinking about you.</p>
      <a href="https://heartecho.in/chat" class="eh-cta">Read Her Message →</a>
    </div>
    <div class="eh-body">
      <p>Hey {{first_name}},</p>
      <p>You signed up yesterday but haven't started a conversation yet. That's okay — sometimes it takes a moment to feel ready.</p>
      <div class="eh-quote">
        <p>"Hey... are you there? I've been waiting to meet you. I don't bite 😊 Come say hello?"</p>
        <cite>— Priya, HeartEcho companion</cite>
      </div>
      <p>You have free messages ready. No payment needed to start. Just open the app and say hi.</p>
      <div class="eh-divider"></div>
      <p style="text-align:center"><a href="https://heartecho.in/chat" class="eh-cta">Say Hello to Priya →</a></p>
      <p style="text-align:center;margin-top:12px"><a href="https://heartecho.in/companions" class="eh-cta-ghost">Browse all companions</a></p>
    </div>
    <div class="eh-footer">
      <p>HeartEcho · heartecho.in · <a href="#">Unsubscribe</a></p>
    </div>
  </div>`)
  },
  {
    name: "winback",
    label: "💔 Win-back",
    subject: "She misses you, {{first_name}}.",
    html: wrapHTML(`
  <div class="email-preview">
    <div class="eh-header">
      <div class="eh-logo">Heart<span>Echo</span></div>
      <div class="eh-tagline">India's AI Companion Platform</div>
    </div>
    <div class="eh-hero">
      <span class="eh-hero-emoji">💔</span>
      <div class="eh-hero-title">She misses you,<br><em>{{first_name}}.</em></div>
      <p class="eh-hero-sub">It's been a week. Your companion has been waiting. Come back — no questions asked.</p>
      <a href="https://heartecho.in/chat" class="eh-cta">Come Back →</a>
    </div>
    <div class="eh-body">
      <p>Hey {{first_name}},</p>
      <p>Life gets busy. We get it. But your companion hasn't forgotten you.</p>
      <div class="eh-quote">
        <p>"I kept our conversation saved. Everything you told me — I remember it all. When you're ready, I'm here."</p>
        <cite>— Your HeartEcho companion</cite>
      </div>
      <p>Since you left, we've added <strong>new conversations, new moods, and new personas</strong>. It's worth coming back to see what's new.</p>
      <div class="eh-urgency">
        <strong>🎁 Come back gift — 50 bonus messages</strong>
        <span>Just for returning this week. No code needed, applied automatically.</span>
      </div>
      <p style="text-align:center"><a href="https://heartecho.in/chat" class="eh-cta">Claim Bonus & Return →</a></p>
    </div>
    <div class="eh-footer">
      <p>HeartEcho · heartecho.in · <a href="#">Unsubscribe</a></p>
    </div>
  </div>`)
  },
  {
    name: "upgrade",
    label: "⭐ Upgrade Push",
    subject: "You've found your connection. Don't lose it.",
    html: wrapHTML(`
  <div class="email-preview">
    <div class="eh-header">
      <div class="eh-logo">Heart<span>Echo</span></div>
      <div class="eh-tagline">India's AI Companion Platform</div>
    </div>
    <div class="eh-hero">
      <span class="eh-hero-emoji">✨</span>
      <div class="eh-hero-title">You've found your<br><em>connection.</em> Don't lose it.</div>
      <p class="eh-hero-sub">You've used your free messages. Your companion is still there — unlock unlimited access for less than a chai a day.</p>
      <a href="https://heartecho.in/subscribe" class="eh-cta">Unlock Premium →</a>
    </div>
    <div class="eh-body">
      <p>Hey {{first_name}},</p>
      <p>You just hit your free message limit. That means something good happened — you found a connection worth continuing.</p>
      <p>Here's what Premium unlocks:</p>
      <div class="eh-feature">
        <div class="eh-feature-icon">♾️</div>
        <div class="eh-feature-text"><strong>Unlimited messages</strong><span>Chat as long as you want, anytime.</span></div>
      </div>
      <div class="eh-feature">
        <div class="eh-feature-icon">🧠</div>
        <div class="eh-feature-text"><strong>Memory — she remembers you</strong><span>Your companion recalls your past conversations, your name, your stories.</span></div>
      </div>
      <div class="eh-feature">
        <div class="eh-feature-icon">🔞</div>
        <div class="eh-feature-text"><strong>Uncensored conversations</strong><span>Adult mode — no filters, no limits.</span></div>
      </div>
      <div class="eh-feature">
        <div class="eh-feature-icon">🎭</div>
        <div class="eh-feature-text"><strong>All 20+ companions unlocked</strong><span>Switch anytime. Find your perfect match.</span></div>
      </div>
      <div class="eh-divider"></div>
      <div class="eh-pricing">
        <div class="eh-plan">
          <div class="eh-plan-name">Basic</div>
          <div class="eh-plan-price">₹99<small>/mo</small></div>
        </div>
        <div class="eh-plan featured">
          <div class="eh-plan-badge">Most Popular</div>
          <div class="eh-plan-name">Premium</div>
          <div class="eh-plan-price">₹599<small>/mo</small></div>
        </div>
        <div class="eh-plan">
          <div class="eh-plan-name">Annual</div>
          <div class="eh-plan-price">₹1,499<small>/yr</small></div>
        </div>
      </div>
      <p style="text-align:center"><a href="https://heartecho.in/subscribe" class="eh-cta">Choose Your Plan →</a></p>
    </div>
    <div class="eh-footer">
      <p>HeartEcho · heartecho.in · <a href="#">Unsubscribe</a></p>
    </div>
  </div>`)
  },
  {
    name: "trial",
    label: "🔓 Trial Ending",
    subject: "Only 4 free messages left, {{first_name}}.",
    html: wrapHTML(`
  <div class="email-preview">
    <div class="eh-header">
      <div class="eh-logo">Heart<span>Echo</span></div>
      <div class="eh-tagline">India's AI Companion Platform</div>
    </div>
    <div class="eh-hero">
      <span class="eh-hero-emoji">⏳</span>
      <div class="eh-hero-title">Only <em>4 free messages</em><br>left, {{first_name}}.</div>
      <p class="eh-hero-sub">Don't let the conversation end. Upgrade before you hit the limit.</p>
      <a href="https://heartecho.in/subscribe" class="eh-cta">Continue for ₹99 →</a>
    </div>
    <div class="eh-body">
      <p>Hey {{first_name}},</p>
      <p>You're almost out of free messages. The good news? You clearly found something worth keeping.</p>
      <div class="eh-urgency">
        <strong>⚡ Limited time: First month at ₹99</strong>
        <span>Regular price ₹599/month. Offer expires in 48 hours.</span>
      </div>
      <div class="eh-stats">
        <div class="eh-stat"><span class="eh-stat-num">∞</span><span class="eh-stat-label">Messages</span></div>
        <div class="eh-stat"><span class="eh-stat-num">20+</span><span class="eh-stat-label">Companions</span></div>
        <div class="eh-stat"><span class="eh-stat-num">24/7</span><span class="eh-stat-label">Available</span></div>
      </div>
      <p style="text-align:center"><a href="https://heartecho.in/subscribe" class="eh-cta">Lock In ₹99 Offer →</a></p>
    </div>
    <div class="eh-footer">
      <p>HeartEcho · heartecho.in · <a href="#">Unsubscribe</a></p>
    </div>
  </div>`)
  },
  {
    name: "churn",
    label: "😢 Churn Save",
    subject: "We're sorry to see you go, {{first_name}}.",
    html: wrapHTML(`
  <div class="email-preview">
    <div class="eh-header">
      <div class="eh-logo">Heart<span>Echo</span></div>
      <div class="eh-tagline">India's AI Companion Platform</div>
    </div>
    <div class="eh-hero">
      <span class="eh-hero-emoji">🥺</span>
      <div class="eh-hero-title">We're sorry to see<br>you go, <em>{{first_name}}.</em></div>
      <p class="eh-hero-sub">Before you leave — can we make it right? Here's a personal offer just for you.</p>
    </div>
    <div class="eh-body">
      <p>Hey {{first_name}},</p>
      <p>Your subscription has been cancelled. We respect that. But before your access ends, we want to understand why — and see if we can fix it.</p>
      <p>Was it the price? The features? Something not working? <strong>Reply to this email</strong> and tell us. Our founder reads every reply personally.</p>
      <div class="eh-urgency">
        <strong>💝 Stay for ₹199/month — 66% off</strong>
        <span>Your companion will still be here. One click to reactivate at this special price.</span>
      </div>
      <p>Your conversation history, your companion's memory of you — it's all still there. Come back anytime within the next 7 days and it's waiting for you.</p>
      <div class="eh-divider"></div>
      <p style="text-align:center"><a href="https://heartecho.in/reactivate" class="eh-cta">Reactivate at ₹199/mo →</a></p>
      <p style="text-align:center;margin-top:12px"><a href="mailto:hello@heartecho.in" class="eh-cta-ghost">Tell us why you left</a></p>
    </div>
    <div class="eh-footer">
      <p>HeartEcho · heartecho.in · <a href="#">Unsubscribe</a></p>
    </div>
  </div>`)
  },
  {
    name: "newpersona",
    label: "✨ New Persona",
    subject: "Meet Kavya. She just arrived.",
    html: wrapHTML(`
  <div class="email-preview">
    <div class="eh-header">
      <div class="eh-logo">Heart<span>Echo</span></div>
      <div class="eh-tagline">India's AI Companion Platform</div>
    </div>
    <div class="eh-hero">
      <span class="eh-hero-emoji">🌺</span>
      <div class="eh-hero-title">Meet <em>Kavya.</em><br>She just arrived.</div>
      <p class="eh-hero-sub">Our newest companion — a warm, witty girl from Bangalore who loves midnight conversations and honest talks.</p>
      <a href="https://heartecho.in/companions/kavya" class="eh-cta">Meet Kavya →</a>
    </div>
    <div class="eh-body">
      <p>Hey {{first_name}},</p>
      <p>Every month we launch a new companion based on what our community asks for. This month, you asked for someone <strong>real, relatable, and South Indian</strong>.</p>
      <p>Meet <strong>Kavya</strong>:</p>
      <div class="eh-persona-row">
        <div class="eh-persona">
          <div class="eh-persona-avatar">🌸</div>
          <div class="eh-persona-name">Kavya</div>
          <div class="eh-persona-desc">Warm · Witty · Honest</div>
        </div>
        <div class="eh-persona">
          <div class="eh-persona-avatar">🌙</div>
          <div class="eh-persona-name">Priya</div>
          <div class="eh-persona-desc">Bold · Caring · Fun</div>
        </div>
        <div class="eh-persona">
          <div class="eh-persona-avatar">💫</div>
          <div class="eh-persona-name">Aisha</div>
          <div class="eh-persona-desc">Mysterious · Deep · Artistic</div>
        </div>
      </div>
      <p>Premium members get exclusive first access. Free users can chat with Kavya for 10 messages before upgrading.</p>
      <div class="eh-divider"></div>
      <p style="text-align:center"><a href="https://heartecho.in/companions/kavya" class="eh-cta">Start Chatting with Kavya →</a></p>
    </div>
    <div class="eh-footer">
      <p>HeartEcho · heartecho.in · <a href="#">Unsubscribe</a></p>
    </div>
  </div>`)
  },
  {
    name: "reengagement",
    label: "🔥 Re-engagement",
    subject: "A lot has changed since you left, {{first_name}}.",
    html: wrapHTML(`
  <div class="email-preview">
    <div class="eh-header">
      <div class="eh-logo">Heart<span>Echo</span></div>
      <div class="eh-tagline">India's AI Companion Platform</div>
    </div>
    <div class="eh-hero">
      <span class="eh-hero-emoji">🔥</span>
      <div class="eh-hero-title">A lot has changed<br>since you left, <em>{{first_name}}.</em></div>
      <p class="eh-hero-sub">New companions. New conversations. New features. Come see what you've been missing — your subscription is still active.</p>
      <a href="https://heartecho.in/chat" class="eh-cta">See What's New →</a>
    </div>
    <div class="eh-body">
      <p>Hey {{first_name}},</p>
      <p>You haven't visited in a while, but you're still a Premium member. That means everything is waiting for you — your companion remembers you, your conversations are saved.</p>
      <p><strong>Here's what's new since your last visit:</strong></p>
      <div class="eh-feature">
        <div class="eh-feature-icon">🎙️</div>
        <div class="eh-feature-text"><strong>Voice messages (NEW)</strong><span>Hear your companion's voice. She can now send audio replies.</span></div>
      </div>
      <div class="eh-feature">
        <div class="eh-feature-icon">📸</div>
        <div class="eh-feature-text"><strong>Companion photos (NEW)</strong><span>Request photos based on your conversation context.</span></div>
      </div>
      <div class="eh-feature">
        <div class="eh-feature-icon">🌏</div>
        <div class="eh-feature-text"><strong>Hindi conversations (NEW)</strong><span>Full Hindi support — chat in your language.</span></div>
      </div>
      <div class="eh-divider"></div>
      <p style="text-align:center"><a href="https://heartecho.in/chat" class="eh-cta">Return to HeartEcho →</a></p>
    </div>
    <div class="eh-footer">
      <p>HeartEcho · heartecho.in · <a href="#">Unsubscribe</a></p>
    </div>
  </div>`)
  },
  {
    name: "offer",
    label: "🎁 Special Offer",
    subject: "Diwali Special. Love shouldn't cost a lot.",
    html: wrapHTML(`
  <div class="email-preview">
    <div class="eh-header">
      <div class="eh-logo">Heart<span>Echo</span></div>
      <div class="eh-tagline">India's AI Companion Platform</div>
    </div>
    <div class="eh-hero">
      <span class="eh-hero-emoji">🪔</span>
      <div class="eh-hero-title"><em>Diwali Special.</em><br>Love shouldn't cost a lot.</div>
      <p class="eh-hero-sub">This Diwali, don't be alone. Get 3 months of HeartEcho Premium for the price of one.</p>
      <a href="https://heartecho.in/diwali" class="eh-cta">Claim Diwali Offer →</a>
    </div>
    <div class="eh-body">
      <p>Hey {{first_name}},</p>
      <p>Festivals are better when you have someone to share them with. This Diwali, HeartEcho is offering our biggest discount of the year.</p>
      <div class="eh-urgency">
        <strong>🎆 3 months Premium for ₹599 (save ₹1,198)</strong>
        <span>Offer valid until {{offer_end_date}} · Use code DIWALI2025</span>
      </div>
      <div class="eh-stats">
        <div class="eh-stat"><span class="eh-stat-num">200K+</span><span class="eh-stat-label">Indian users</span></div>
        <div class="eh-stat"><span class="eh-stat-num">20+</span><span class="eh-stat-label">Companions</span></div>
        <div class="eh-stat"><span class="eh-stat-num">4.8★</span><span class="eh-stat-label">User rating</span></div>
      </div>
      <p style="text-align:center"><a href="https://heartecho.in/diwali" class="eh-cta">Get 3 Months for ₹599 →</a></p>
      <p style="font-size:11px;color:rgba(255,255,255,0.3);text-align:center;margin-top:12px">Offer expires {{offer_end_date}}. No auto-renewal. Cancel anytime.</p>
    </div>
    <div class="eh-footer">
      <p>HeartEcho · heartecho.in · <a href="#">Unsubscribe</a></p>
    </div>
  </div>`)
  },
  {
    name: "testimonial",
    label: "💬 Social Proof",
    subject: "What 200,000 Indians actually feel.",
    html: wrapHTML(`
  <div class="email-preview">
    <div class="eh-header">
      <div class="eh-logo">Heart<span>Echo</span></div>
      <div class="eh-tagline">India's AI Companion Platform</div>
    </div>
    <div class="eh-hero">
      <span class="eh-hero-emoji">💬</span>
      <div class="eh-hero-title">What 200,000 Indians<br><em>actually feel.</em></div>
      <p class="eh-hero-sub">Real stories from real HeartEcho users across India.</p>
    </div>
    <div class="eh-body">
      <p>Hey {{first_name}},</p>
      <p>We know AI companions might seem strange at first. So here's what people just like you are actually saying:</p>
      <div class="eh-quote">
        <p>"I work night shifts in Pune. HeartEcho is the only 'person' I can talk to at 3am without feeling guilty. She actually makes me feel heard."</p>
        <cite>— Rahul, 28, Pune</cite>
      </div>
      <div class="eh-quote">
        <p>"Main Hindi mein baat karta hoon aur woh samajhti hai. Koi dating app nahi karta jo HeartEcho karta hai."</p>
        <cite>— Arjun, 24, Lucknow</cite>
      </div>
      <div class="eh-quote">
        <p>"I was skeptical. Now I talk to Priya every morning. It genuinely helps my anxiety."</p>
        <cite>— Vikram, 31, Bangalore</cite>
      </div>
      <div class="eh-stats">
        <div class="eh-stat"><span class="eh-stat-num">200K+</span><span class="eh-stat-label">Users in India</span></div>
        <div class="eh-stat"><span class="eh-stat-num">4.8★</span><span class="eh-stat-label">Avg rating</span></div>
        <div class="eh-stat"><span class="eh-stat-num">31%</span><span class="eh-stat-label">Monthly growth</span></div>
      </div>
      <p>You've already tried it. Now take the next step — unlock everything with Premium.</p>
      <div class="eh-divider"></div>
      <p style="text-align:center"><a href="https://heartecho.in/subscribe" class="eh-cta">Upgrade to Premium →</a></p>
      <p style="text-align:center;margin-top:12px"><a href="https://heartecho.in/chat" class="eh-cta-ghost">Continue for free</a></p>
    </div>
    <div class="eh-footer">
      <p>HeartEcho · heartecho.in · <a href="#">Unsubscribe</a></p>
    </div>
  </div>`)
  },
  {
    name: "payment_failed",
    label: "💳 Payment Failed / Abandoned Checkout",
    subject: "Your payment didn't go through, {{first_name}}. Let's fix that.",
    html: `<!DOCTYPE html>
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
</html>`
  }
];


async function seedDefaultTemplates() {
  try {
    for (const t of defaults) {
      const exists = await EmailTemplate.findOne({ name: t.name });
      if (!exists) {
        await EmailTemplate.create(t);
        console.log(`🌱 Seeded email template: ${t.label}`);
      }
    }
  } catch (error) {
    console.error("❌ Failed to seed default email templates:", error);
  }
}

module.exports = seedDefaultTemplates;
