const nodemailer = require("nodemailer");
const SmtpCredential = require("../models/SmtpCredential");
const EmailTemplate = require("../models/EmailTemplate");
const EmailCampaign = require("../models/EmailCampaign");
const EmailQueue = require("../models/EmailQueue");
const User = require("../models/User");

let isProcessing = false;
const SEND_DELAY_MS = 4000; // 4 seconds delay between emails to prevent spam bans

// Helper to replace template placeholders
function renderTemplate(html, variables) {
  let rendered = html;
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = new RegExp(`{{${key}}}`, "g");
    rendered = rendered.replace(placeholder, value || "");
  }
  return rendered;
}

// Helper to rewrite links to route through click tracking
function rewriteLinks(html, trackingId, backendUrl) {
  // Regex matches href="http..." or href='http...' but excludes anchor links (#), mailto, etc.
  const hrefRegex = /href=(["'])(https?:\/\/[^"'\s>]+)\1/gi;
  
  return html.replace(hrefRegex, (match, quote, originalUrl) => {
    // Avoid rewriting tracking links themselves
    if (originalUrl.includes("/email-marketing/track/")) {
      return match;
    }
    const trackingUrl = `${backendUrl}/api/v1/api/email-marketing/track/click/${trackingId}?url=${encodeURIComponent(originalUrl)}`;
    return `href=${quote}${trackingUrl}${quote}`;
  });
}

// Main processing iteration
async function processNextEmail() {
  const backendUrl = process.env.BACKEND_URL || "https://heartecho-lm9j.onrender.com";
  
  try {
    // Find next pending email
    const queueItem = await EmailQueue.findOne({ status: "pending" })
      .populate("campaign")
      .populate("user");

    if (!queueItem) {
      // No pending emails
      return false;
    }

    // Set to sending immediately to lock this item
    queueItem.status = "sending";
    await queueItem.save();

    // 1. Select SMTP Credential
    let selectedSmtp = null;
    let fallbackTransporter = false;

    // Find active credentials that haven't hit their daily limit
    const credentials = await SmtpCredential.find({ active: true });
    const availableCredentials = credentials.filter(cred => cred.emailsSentToday < cred.limitDaily);

    if (availableCredentials.length > 0) {
      // Rotate: select the one sent longest ago or with fewer sends
      availableCredentials.sort((a, b) => {
        if (!a.lastSentAt) return -1;
        if (!b.lastSentAt) return 1;
        return a.lastSentAt - b.lastSentAt;
      });
      selectedSmtp = availableCredentials[0];
    } else {
      // No SMTP accounts in database, check environment fallback
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        fallbackTransporter = true;
        selectedSmtp = {
          email: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
          host: "smtp.gmail.com",
          port: 465,
          secure: true
        };
      }
    }

    if (!selectedSmtp) {
      queueItem.status = "pending";
      queueItem.error = "No active SMTP credentials available (all limited or none configured)";
      await queueItem.save();
      console.log("⚠️ Email Marketing queue paused: No active SMTP credentials.");
      return false;
    }

    // 2. Setup Transporter
    const transportConfig = {
      host: selectedSmtp.host || "smtp.gmail.com",
      port: selectedSmtp.port || 465,
      secure: selectedSmtp.secure !== undefined ? selectedSmtp.secure : true,
      auth: {
        user: selectedSmtp.email,
        pass: selectedSmtp.pass
      },
      connectionTimeout: 15000, // 15s connection timeout to prevent hanging
      socketTimeout: 15000,     // 15s socket timeout
      tls: {
        rejectUnauthorized: false // Bypass SSL self-signed rejection
      }
    };

    const transporter = nodemailer.createTransport(transportConfig);

    // 3. Render HTML and inject tracking
    const recipientName = queueItem.user ? queueItem.user.name : "there";
    const first_name = recipientName.split(" ")[0];
    
    // Default campaign variables
    const variables = {
      first_name,
      email: queueItem.toEmail,
      offer_end_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
      })
    };

    let emailHtml = renderTemplate(queueItem.html, variables);

    // Rewrite all links in body
    emailHtml = rewriteLinks(emailHtml, queueItem.trackingId, backendUrl);

    // Inject tracking open pixel at the end of the email HTML
    const trackingPixel = `<img src="${backendUrl}/api/v1/api/email-marketing/track/open/${queueItem.trackingId}" width="1" height="1" style="display:none;" />`;
    if (emailHtml.includes("</body>")) {
      emailHtml = emailHtml.replace("</body>", `${trackingPixel}</body>`);
    } else {
      emailHtml += trackingPixel;
    }

    // 4. Send Email
    const mailOptions = {
      from: `"HeartEcho ❤️" <${selectedSmtp.email}>`,
      to: queueItem.toEmail,
      subject: queueItem.subject,
      html: emailHtml
    };

    console.log(`✉️ Sending email to ${queueItem.toEmail} via ${selectedSmtp.email}...`);
    
    await transporter.sendMail(mailOptions);

    // 5. Success Logging
    queueItem.status = "sent";
    queueItem.sentAt = new Date();
    if (!fallbackTransporter) {
      queueItem.smtpCredential = selectedSmtp._id;
    }
    await queueItem.save();

    // Update SMTP statistics
    if (!fallbackTransporter) {
      await SmtpCredential.findByIdAndUpdate(selectedSmtp._id, {
        $inc: { emailsSentToday: 1 },
        $set: { lastSentAt: new Date(), errorMessage: "" }
      });
    }

    // Update Campaign statistics
    if (queueItem.campaign) {
      await EmailCampaign.findByIdAndUpdate(queueItem.campaign._id, {
        $inc: { sentCount: 1 }
      });
    }

    console.log(`✅ Successfully sent email to ${queueItem.toEmail}`);
    return true;

  } catch (error) {
    console.error(`❌ Failed to send email to ${queueItem ? queueItem.toEmail : 'unknown'}:`, error);
    
    if (queueItem) {
      queueItem.status = "failed";
      queueItem.error = error.message;
      await queueItem.save();

      // Deactivate credentials if authorization fails
      if (error.message.includes("Invalid login") || error.message.includes("Username and Password not accepted")) {
        const errorCred = await SmtpCredential.findOne({ email: mailOptions.from.match(/<(.+)>/)[1] });
        if (errorCred) {
          errorCred.active = false;
          errorCred.errorMessage = `Authentication failed: ${error.message}`;
          await errorCred.save();
          console.log(`⚠️ SMTP credential ${errorCred.email} deactivated due to login error.`);
        }
      }
    }
    return true;
  }
}

// Queue running engine
async function startQueueProcessor() {
  if (isProcessing) return;
  isProcessing = true;

  console.log("⚙️ HeartEcho Email Marketing Queue Processor Started.");

  while (true) {
    const sent = await processNextEmail();
    if (sent) {
      // Delay before checking the next email
      await new Promise(resolve => setTimeout(resolve, SEND_DELAY_MS));
    } else {
      // No emails found, wait longer before scanning again
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
}

// Daily reset of SMTP counts (can be called by a cron job)
async function resetSmtpDailyCounts() {
  try {
    await SmtpCredential.updateMany({}, { $set: { emailsSentToday: 0 } });
    console.log("🔄 Reset SMTP daily sent counts successfully.");
  } catch (error) {
    console.error("❌ Failed to reset SMTP counts:", error);
  }
}

module.exports = {
  startQueueProcessor,
  resetSmtpDailyCounts
};
