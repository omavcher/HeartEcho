const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail(to, otp, type = "login") {
    const isForgot = type === "forgot";
    const subject = isForgot 
        ? `${otp} is your HeartEcho password reset code` 
        : `${otp} is your HeartEcho verification code`;
    const heading = isForgot ? "Reset Your Password" : "Secure Login";
    const bodyText = isForgot 
        ? "You've requested to reset your password. Please use the following One-Time Password (OTP) to verify your identity and set a new password:"
        : "You've requested to securely access your account. Please use the following One-Time Password (OTP) to complete your verification:";

    try {
        const { data, error } = await resend.emails.send({
            from: "HeartEcho <security@heartecho.in>", 
            to: [to],
            subject: subject,
            html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
                    body {
                        font-family: 'DM Sans', -apple-system, sans-serif;
                        background-color: #120524;
                        color: #e2d8f0;
                        margin: 0;
                        padding: 40px 20px;
                        -webkit-text-size-adjust: 100%;
                    }
                    .container {
                        max-width: 480px;
                        margin: 0 auto;
                        background-color: #0f0620;
                        border: 1px solid rgba(233, 30, 140, 0.2);
                        border-radius: 12px;
                        padding: 40px 32px;
                        text-align: center;
                        box-shadow: 0 8px 32px rgba(233, 30, 140, 0.1);
                    }
                    .logo {
                        font-size: 26px;
                        font-weight: 600;
                        color: #ffffff;
                        margin-bottom: 24px;
                        letter-spacing: 0.05em;
                    }
                    .logo span {
                        color: #ff4099;
                    }
                    h2 {
                        color: #ffffff;
                        font-size: 20px;
                        font-weight: 500;
                        margin-bottom: 12px;
                        margin-top: 0;
                    }
                    p {
                        font-size: 14px;
                        line-height: 1.6;
                        color: #a395b5;
                        margin-bottom: 28px;
                    }
                    .otp-box {
                        font-size: 36px;
                        font-weight: 600;
                        letter-spacing: 12px;
                        color: #ffffff;
                        background: linear-gradient(135deg, rgba(233,30,140,0.15), rgba(156,39,176,0.15));
                        border: 1px solid rgba(233, 30, 140, 0.3);
                        padding: 20px 24px;
                        border-radius: 12px;
                        display: inline-block;
                        margin-bottom: 28px;
                    }
                    .footer {
                        margin-top: 32px;
                        padding-top: 24px;
                        border-top: 1px solid rgba(255, 255, 255, 0.05);
                        font-size: 12px;
                        color: #7b6d8d;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="logo">Heart<span>Echo</span></div>
                    <h2>${heading}</h2>
                    <p>${bodyText}</p>
                    
                    <div class="otp-box">${otp}</div>
                    
                    <p style="font-size: 13px;">This code is valid for <strong>10 minutes</strong>. If you didn't request this, you can safely ignore this email.</p>
                    
                    <div class="footer">
                        &copy; 2026 HeartEcho. All rights reserved.
                    </div>
                </div>
            </body>
            </html>
            `
        });

        if (error) {
            console.error("Resend API error:", error);
            throw new Error(error.message || JSON.stringify(error));
        }
        
        return data;

    } catch (error) {
        console.error("Failed to send OTP email:", error);
        throw error;
    }
}

/**
 * Send Subscription Confirmation Email via Resend
 * 100% Inline CSS & Table Layout for perfect mobile and desktop client compatibility.
 */
async function sendSubscriptionEmail({ 
    to, 
    userName = "",
    planName = "Premium Plan", 
    startDate, 
    expiryDate, 
    paymentMethod = "Online Payment", 
    amountStr = "₹99.00",
    transactionId = ""
}) {
    if (!to) {
        throw new Error("Recipient email 'to' is required for sendSubscriptionEmail");
    }

    const subject = `✨ Subscription Successful - HeartEcho ${planName}`;
    
    const formatDate = (d) => {
        if (!d) return "N/A";
        const dateObj = d instanceof Date ? d : new Date(d);
        if (isNaN(dateObj.getTime())) return String(d);
        return dateObj.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
    };

    const startDateFormatted = formatDate(startDate || new Date());
    const expiryDateFormatted = formatDate(expiryDate);
    const greetingText = userName ? `Hi <strong style="color: #ffffff;">${userName}</strong>, ` : '';

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Subscription Successful - HeartEcho</title>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff; -webkit-font-smoothing: antialiased;">

<table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #09090b; width: 100%; margin: 0; padding: 20px 10px;">
    <tr>
        <td align="center">
            
            <table width="100%" max-width="580" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 580px; margin-bottom: 12px;">
                <tr>
                    <td align="left" style="font-size: 12px; color: #a1a1aa; padding: 0 4px;">
                        Thank you for choosing HeartEcho 💖
                    </td>
                    <td align="right" style="font-size: 12px; color: #ff70a6; padding: 0 4px;">
                        <a href="https://heartecho.in/subscribe?utm_source=email&utm_medium=resend&utm_campaign=subscription_success" style="color: #ff70a6; text-decoration: underline;">View in browser</a>
                    </td>
                </tr>
            </table>

            <table width="100%" max-width="580" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 580px; background-color: #121214; border-radius: 20px; border: 1px solid #242429; padding: 30px 24px;">
                
                <tr>
                    <td align="center" style="padding-bottom: 30px;">
                        <table border="0" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                                <td align="center">
                                    <div style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: 1px;">
                                        <span style="color: #ff3385;">❤️</span> HEART<span style="color: #ff3385;">ECHO</span>
                                    </div>
                                    <div style="font-size: 12px; color: #a1a1aa; margin-top: 4px;">Your AI Companion, Always With You</div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <tr>
                    <td style="padding-bottom: 30px;">
                        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                                <td valign="middle" align="left" style="padding-right: 10px;">
                                    <div style="font-size: 28px; line-height: 1.25; font-weight: 700; color: #ffffff; margin-bottom: 12px;">
                                        Subscription<br><span style="color: #ff3385;">Successful! 🎉</span>
                                    </div>
                                    <div style="font-size: 14px; line-height: 1.5; color: #a1a1aa;">
                                        ${greetingText}thank you for upgrading to <br><span style="color: #ff70a6; font-weight: 600;">HeartEcho ${planName}</span>. You now have full, unrestricted access to all premium features.
                                    </div>
                                </td>
                                <td valign="middle" align="right" width="130" style="width: 130px;">
                                    <img src="https://cdn.heartecho.in/Promotion%20And%20Hosting%20Datas/924ffb7e-e2ae-4f51-a65c-5196a4fb802d.png" width="120" style="width: 120px; height: auto; border-radius: 12px; display: block; border: 0;" alt="Subscription Success">
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <tr>
                    <td align="left" style="font-size: 16px; font-weight: 700; color: #ffffff; padding-bottom: 12px;">
                        Subscription Details
                    </td>
                </tr>

                <tr>
                    <td style="padding-bottom: 30px;">
                        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #1c1c1e; border-radius: 14px; border-collapse: separate; border-spacing: 0;">
                            
                            <tr>
                                <td align="left" style="padding: 14px 16px; color: #a1a1aa; font-size: 14px; border-bottom: 1px solid #2c2c2e;">
                                    <span style="color: #ff3385; margin-right: 8px;">ℹ️</span> Plan
                                </td>
                                <td align="right" style="padding: 14px 16px; color: #ff70a6; font-size: 14px; font-weight: 600; border-bottom: 1px solid #2c2c2e;">
                                    ${planName}
                                </td>
                            </tr>

                            <tr>
                                <td align="left" style="padding: 14px 16px; color: #a1a1aa; font-size: 14px; border-bottom: 1px solid #2c2c2e;">
                                    <span style="color: #ff3385; margin-right: 8px;">📅</span> Start Date
                                </td>
                                <td align="right" style="padding: 14px 16px; color: #ffffff; font-size: 14px; font-weight: 500; border-bottom: 1px solid #2c2c2e;">
                                    ${startDateFormatted}
                                </td>
                            </tr>

                            <tr>
                                <td align="left" style="padding: 14px 16px; color: #a1a1aa; font-size: 14px; border-bottom: 1px solid #2c2c2e;">
                                    <span style="color: #ff3385; margin-right: 8px;">🔄</span> Next Billing Date
                                </td>
                                <td align="right" style="padding: 14px 16px; color: #ffffff; font-size: 14px; font-weight: 500; border-bottom: 1px solid #2c2c2e;">
                                    ${expiryDateFormatted}
                                </td>
                            </tr>

                            <tr>
                                <td align="left" style="padding: 14px 16px; color: #a1a1aa; font-size: 14px; border-bottom: 1px solid #2c2c2e;">
                                    <span style="color: #ff3385; margin-right: 8px;">💳</span> Payment Method
                                </td>
                                <td align="right" style="padding: 14px 16px; color: #ffffff; font-size: 14px; font-weight: 500; border-bottom: 1px solid #2c2c2e;">
                                    ${paymentMethod}
                                </td>
                            </tr>

                            <tr>
                                <td align="left" style="padding: 14px 16px; color: #a1a1aa; font-size: 14px; ${transactionId ? 'border-bottom: 1px solid #2c2c2e;' : ''}">
                                    <span style="color: #ff3385; margin-right: 8px;">🧾</span> Amount Paid
                                </td>
                                <td align="right" style="padding: 14px 16px; color: #ffffff; font-size: 14px; font-weight: 600; ${transactionId ? 'border-bottom: 1px solid #2c2c2e;' : ''}">
                                    ${amountStr}
                                </td>
                            </tr>

                            ${transactionId ? `
                            <tr>
                                <td align="left" style="padding: 14px 16px; color: #a1a1aa; font-size: 14px;">
                                    <span style="color: #ff3385; margin-right: 8px;">🔢</span> Transaction ID
                                </td>
                                <td align="right" style="padding: 14px 16px; color: #a1a1aa; font-size: 12px; font-family: monospace;">
                                    ${transactionId}
                                </td>
                            </tr>
                            ` : ''}

                        </table>
                    </td>
                </tr>

                <tr>
                    <td align="left" style="font-size: 16px; font-weight: 700; color: #ffffff; padding-bottom: 14px;">
                        What You Now Get
                    </td>
                </tr>

                <tr>
                    <td style="padding-bottom: 30px;">
                        <table width="100%" border="0" cellpadding="0" cellspacing="8" role="presentation">
                            <tr>
                                <td width="50%" align="center" valign="top" style="background-color: #1c1c1e; border-radius: 12px; padding: 16px 10px;">
                                    <div style="font-size: 22px; margin-bottom: 6px;">💬</div>
                                    <div style="font-size: 13px; color: #ffffff; font-weight: 600; line-height: 1.3;">Unlimited<br>Messages</div>
                                </td>
                                <td width="50%" align="center" valign="top" style="background-color: #1c1c1e; border-radius: 12px; padding: 16px 10px;">
                                    <div style="font-size: 22px; margin-bottom: 6px;">🎙️</div>
                                    <div style="font-size: 13px; color: #ffffff; font-weight: 600; line-height: 1.3;">Unlimited<br>Voice Chats</div>
                                </td>
                            </tr>
                            <tr>
                                <td width="50%" align="center" valign="top" style="background-color: #1c1c1e; border-radius: 12px; padding: 16px 10px;">
                                    <div style="font-size: 22px; margin-bottom: 6px;">🎁</div>
                                    <div style="font-size: 13px; color: #ffffff; font-weight: 600; line-height: 1.3;">Exclusive<br>Gifts & Rewards</div>
                                </td>
                                <td width="50%" align="center" valign="top" style="background-color: #1c1c1e; border-radius: 12px; padding: 16px 10px;">
                                    <div style="font-size: 22px; margin-bottom: 6px;">⭐</div>
                                    <div style="font-size: 13px; color: #ffffff; font-weight: 600; line-height: 1.3;">Priority<br>Support</div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <tr>
                    <td align="center" style="padding-bottom: 24px;">
                        <a href="https://heartecho.in/subscribe?utm_source=email&utm_medium=resend&utm_campaign=subscription_success" target="_blank" style="display: block; width: 100%; box-sizing: border-box; background-color: #ff3385; background-image: linear-gradient(135deg, #ff3385 0%, #ff5c9d 100%); color: #ffffff !important; text-align: center; padding: 16px 0; border-radius: 12px; font-size: 16px; font-weight: 700; text-decoration: none;">
                            Open HeartEcho &nbsp; &rarr;
                        </a>
                    </td>
                </tr>

                <tr>
                    <td align="center" style="font-size: 13px; color: #a1a1aa; line-height: 1.5;">
                        If you have any questions, feel free to reach out to us.<br>
                        We're always here for you! 💕
                    </td>
                </tr>

            </table>

            <table width="100%" max-width="580" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 580px; margin-top: 20px;">
                <tr>
                    <td align="center" style="font-size: 12px; color: #71717a; line-height: 1.6;">
                        &copy; ${new Date().getFullYear()} HeartEcho. All rights reserved.<br>
                        HeartEcho Inc. &bull; India
                    </td>
                </tr>
            </table>

        </td>
    </tr>
</table>

</body>
</html>
    `;

    try {
        const { data, error } = await resend.emails.send({
            from: "HeartEcho <security@heartecho.in>",
            to: [to],
            subject: subject,
            html: html
        });

        if (error) {
            console.error("Resend Subscription Email Error:", error);
            throw new Error(error.message || JSON.stringify(error));
        }

        console.log("✅ Subscription email sent successfully via Resend to:", to);
        return data;
    } catch (error) {
        console.error("Failed to send subscription email:", error);
        throw error;
    }
}

/**
 * Send Payment Failed Email via Resend
 */
async function sendPaymentFailedEmail({
    to,
    userName = "",
    planName = "Premium Plan",
    reason = "Payment declined or cancelled",
    amountStr = "₹99.00",
    platform = "web"
}) {
    if (!to) return;
    const subject = `⚠️ Action Required: Your HeartEcho Payment Was Unsuccessful`;
    const greetingText = userName ? `Hi <strong style="color: #ffffff;">${userName}</strong>, ` : '';

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Unsuccessful - HeartEcho</title>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff; -webkit-font-smoothing: antialiased;">

<table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #09090b; width: 100%; margin: 0; padding: 20px 10px;">
    <tr>
        <td align="center">
            
            <table width="100%" max-width="580" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 580px; margin-bottom: 12px;">
                <tr>
                    <td align="left" style="font-size: 12px; color: #a1a1aa; padding: 0 4px;">
                        HeartEcho Account Security 💖
                    </td>
                    <td align="right" style="font-size: 12px; color: #ff70a6; padding: 0 4px;">
                        <a href="https://heartecho.in/subscribe?utm_source=email&utm_medium=resend&utm_campaign=retry_payment" style="color: #ff70a6; text-decoration: underline;">Retry Payment</a>
                    </td>
                </tr>
            </table>

            <table width="100%" max-width="580" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 580px; background-color: #121214; border-radius: 20px; border: 1px solid #242429; padding: 30px 24px;">
                
                <tr>
                    <td align="center" style="padding-bottom: 30px;">
                        <div style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: 1px;">
                            <span style="color: #ff3385;">❤️</span> HEART<span style="color: #ff3385;">ECHO</span>
                        </div>
                        <div style="font-size: 12px; color: #a1a1aa; margin-top: 4px;">Your AI Companion, Always With You</div>
                    </td>
                </tr>

                <tr>
                    <td style="padding-bottom: 30px;">
                        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                                <td valign="middle" align="left">
                                    <div style="font-size: 26px; line-height: 1.25; font-weight: 700; color: #ffffff; margin-bottom: 12px;">
                                        Payment<br><span style="color: #ff3385;">Unsuccessful ⚠️</span>
                                    </div>
                                    <div style="font-size: 14px; line-height: 1.5; color: #a1a1aa;">
                                        ${greetingText}your recent transaction for <span style="color: #ff70a6; font-weight: 600;">HeartEcho ${planName}</span> could not be processed. Don't worry, no charges were made to your account.
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <tr>
                    <td align="left" style="font-size: 16px; font-weight: 700; color: #ffffff; padding-bottom: 12px;">
                        Transaction Summary
                    </td>
                </tr>

                <tr>
                    <td style="padding-bottom: 30px;">
                        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #1c1c1e; border-radius: 14px; border-collapse: separate; border-spacing: 0;">
                            <tr>
                                <td align="left" style="padding: 14px 16px; color: #a1a1aa; font-size: 14px; border-bottom: 1px solid #2c2c2e;">
                                    <span style="color: #ff3385; margin-right: 8px;">ℹ️</span> Plan
                                </td>
                                <td align="right" style="padding: 14px 16px; color: #ff70a6; font-size: 14px; font-weight: 600; border-bottom: 1px solid #2c2c2e;">
                                    ${planName}
                                </td>
                            </tr>
                            <tr>
                                <td align="left" style="padding: 14px 16px; color: #a1a1aa; font-size: 14px; border-bottom: 1px solid #2c2c2e;">
                                    <span style="color: #ff3385; margin-right: 8px;">⚠️</span> Status / Reason
                                </td>
                                <td align="right" style="padding: 14px 16px; color: #ff5c5c; font-size: 14px; font-weight: 500; border-bottom: 1px solid #2c2c2e;">
                                    ${reason}
                                </td>
                            </tr>
                            <tr>
                                <td align="left" style="padding: 14px 16px; color: #a1a1aa; font-size: 14px;">
                                    <span style="color: #ff3385; margin-right: 8px;">🧾</span> Attempted Amount
                                </td>
                                <td align="right" style="padding: 14px 16px; color: #ffffff; font-size: 14px; font-weight: 600;">
                                    ${amountStr}
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <tr>
                    <td align="center" style="padding-bottom: 24px;">
                        <a href="https://heartecho.in/subscribe?utm_source=email&utm_medium=resend&utm_campaign=retry_payment" target="_blank" style="display: block; width: 100%; box-sizing: border-box; background-color: #ff3385; background-image: linear-gradient(135deg, #ff3385 0%, #ff5c9d 100%); color: #ffffff !important; text-align: center; padding: 16px 0; border-radius: 12px; font-size: 16px; font-weight: 700; text-decoration: none;">
                            Retry Payment Now &nbsp; &rarr;
                        </a>
                    </td>
                </tr>

                <tr>
                    <td align="center" style="font-size: 13px; color: #a1a1aa; line-height: 1.5;">
                        If you experienced issues during checkout or need assistance, reply to this email.<br>
                        We're happy to help! 💕
                    </td>
                </tr>

            </table>

            <table width="100%" max-width="580" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 580px; margin-top: 20px;">
                <tr>
                    <td align="center" style="font-size: 12px; color: #71717a; line-height: 1.6;">
                        &copy; ${new Date().getFullYear()} HeartEcho. All rights reserved.<br>
                        HeartEcho Inc. &bull; India
                    </td>
                </tr>
            </table>

        </td>
    </tr>
</table>

</body>
</html>
    `;

    try {
        const { data, error } = await resend.emails.send({
            from: "HeartEcho <security@heartecho.in>",
            to: [to],
            subject: subject,
            html: html
        });
        if (error) {
            console.error("Resend Payment Failed Email Error:", error);
            throw new Error(error.message || JSON.stringify(error));
        }
        console.log("✅ Payment Failed email sent via Resend to:", to);
        return data;
    } catch (err) {
        console.error("Failed to send Payment Failed email:", err);
        throw err;
    }
}

/**
 * Send Abandoned Checkout / Plan Exploration Email via Resend
 */
async function sendCheckoutIntentEmail({
    to,
    userName = "",
    planName = "Premium Plan",
    platform = "web"
}) {
    if (!to) return;
    const subject = `👀 Still Thinking About HeartEcho Premium? Your AI Companion Awaits!`;
    const greetingText = userName ? `Hi <strong style="color: #ffffff;">${userName}</strong>, ` : '';

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your AI Companion Awaits - HeartEcho</title>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff; -webkit-font-smoothing: antialiased;">

<table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #09090b; width: 100%; margin: 0; padding: 20px 10px;">
    <tr>
        <td align="center">
            
            <table width="100%" max-width="580" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 580px; margin-bottom: 12px;">
                <tr>
                    <td align="left" style="font-size: 12px; color: #a1a1aa; padding: 0 4px;">
                        Exclusive HeartEcho Access 💖
                    </td>
                    <td align="right" style="font-size: 12px; color: #ff70a6; padding: 0 4px;">
                        <a href="https://heartecho.in/subscribe?utm_source=email&utm_medium=resend&utm_campaign=abandoned_checkout_recovery" style="color: #ff70a6; text-decoration: underline;">Complete Upgrade</a>
                    </td>
                </tr>
            </table>

            <table width="100%" max-width="580" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 580px; background-color: #121214; border-radius: 20px; border: 1px solid #242429; padding: 30px 24px;">
                
                <tr>
                    <td align="center" style="padding-bottom: 30px;">
                        <div style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: 1px;">
                            <span style="color: #ff3385;">❤️</span> HEART<span style="color: #ff3385;">ECHO</span>
                        </div>
                        <div style="font-size: 12px; color: #a1a1aa; margin-top: 4px;">Your AI Companion, Always With You</div>
                    </td>
                </tr>

                <tr>
                    <td style="padding-bottom: 30px;">
                        <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                            <tr>
                                <td valign="middle" align="left">
                                    <div style="font-size: 26px; line-height: 1.25; font-weight: 700; color: #ffffff; margin-bottom: 12px;">
                                        Your Companion is<br><span style="color: #ff3385;">Waiting for You! 💕</span>
                                    </div>
                                    <div style="font-size: 14px; line-height: 1.5; color: #a1a1aa;">
                                        ${greetingText}we noticed you were exploring <span style="color: #ff70a6; font-weight: 600;">HeartEcho ${planName}</span>! Upgrade today to unlock deep emotional memory, voice calls, and unrestricted private chats.
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <tr>
                    <td align="left" style="font-size: 16px; font-weight: 700; color: #ffffff; padding-bottom: 14px;">
                        Unlocked With Premium:
                    </td>
                </tr>

                <tr>
                    <td style="padding-bottom: 30px;">
                        <table width="100%" border="0" cellpadding="0" cellspacing="8" role="presentation">
                            <tr>
                                <td width="50%" align="center" valign="top" style="background-color: #1c1c1e; border-radius: 12px; padding: 16px 10px;">
                                    <div style="font-size: 22px; margin-bottom: 6px;">💬</div>
                                    <div style="font-size: 13px; color: #ffffff; font-weight: 600; line-height: 1.3;">Unlimited<br>Messages</div>
                                </td>
                                <td width="50%" align="center" valign="top" style="background-color: #1c1c1e; border-radius: 12px; padding: 16px 10px;">
                                    <div style="font-size: 22px; margin-bottom: 6px;">🎙️</div>
                                    <div style="font-size: 13px; color: #ffffff; font-weight: 600; line-height: 1.3;">Unlimited<br>Voice Chats</div>
                                </td>
                            </tr>
                            <tr>
                                <td width="50%" align="center" valign="top" style="background-color: #1c1c1e; border-radius: 12px; padding: 16px 10px;">
                                    <div style="font-size: 22px; margin-bottom: 6px;">🎁</div>
                                    <div style="font-size: 13px; color: #ffffff; font-weight: 600; line-height: 1.3;">Exclusive<br>Gifts & Rewards</div>
                                </td>
                                <td width="50%" align="center" valign="top" style="background-color: #1c1c1e; border-radius: 12px; padding: 16px 10px;">
                                    <div style="font-size: 22px; margin-bottom: 6px;">⭐</div>
                                    <div style="font-size: 13px; color: #ffffff; font-weight: 600; line-height: 1.3;">Priority<br>Support</div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <tr>
                    <td align="center" style="padding-bottom: 24px;">
                        <a href="https://heartecho.in/subscribe?utm_source=email&utm_medium=resend&utm_campaign=abandoned_checkout_recovery" target="_blank" style="display: block; width: 100%; box-sizing: border-box; background-color: #ff3385; background-image: linear-gradient(135deg, #ff3385 0%, #ff5c9d 100%); color: #ffffff !important; text-align: center; padding: 16px 0; border-radius: 12px; font-size: 16px; font-weight: 700; text-decoration: none;">
                            Complete Your Upgrade Now &nbsp; &rarr;
                        </a>
                    </td>
                </tr>

                <tr>
                    <td align="center" style="font-size: 13px; color: #a1a1aa; line-height: 1.5;">
                        Got questions before upgrading? Feel free to reply directly to this email.<br>
                        We're always here for you! 💕
                    </td>
                </tr>

            </table>

            <table width="100%" max-width="580" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 580px; margin-top: 20px;">
                <tr>
                    <td align="center" style="font-size: 12px; color: #71717a; line-height: 1.6;">
                        &copy; ${new Date().getFullYear()} HeartEcho. All rights reserved.<br>
                        HeartEcho Inc. &bull; India
                    </td>
                </tr>
            </table>

        </td>
    </tr>
</table>

</body>
</html>
    `;

    try {
        const { data, error } = await resend.emails.send({
            from: "HeartEcho <security@heartecho.in>",
            to: [to],
            subject: subject,
            html: html
        });
        if (error) {
            console.error("Resend Checkout Intent Email Error:", error);
            throw new Error(error.message || JSON.stringify(error));
        }
        console.log("✅ Checkout Intent email sent via Resend to:", to);
        return data;
    } catch (err) {
        console.error("Failed to send Checkout Intent email:", err);
        throw err;
    }
}

sendEmail.sendSubscriptionEmail = sendSubscriptionEmail;
sendEmail.sendPaymentFailedEmail = sendPaymentFailedEmail;
sendEmail.sendCheckoutIntentEmail = sendCheckoutIntentEmail;

module.exports = sendEmail;
module.exports.sendEmail = sendEmail;
module.exports.sendSubscriptionEmail = sendSubscriptionEmail;
module.exports.sendPaymentFailedEmail = sendPaymentFailedEmail;
module.exports.sendCheckoutIntentEmail = sendCheckoutIntentEmail;
