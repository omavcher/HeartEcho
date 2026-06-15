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
            // UX trick: Putting the OTP first allows users to see the code directly from their phone's lock screen notification
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
        // Catch and log any errors from Resend
        console.error("Failed to send OTP email:", error);
        throw error;
    }
}

module.exports = sendEmail;
