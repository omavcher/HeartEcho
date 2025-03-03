const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER, // Your email
        pass: process.env.EMAIL_PASS  // App password (not your real password)
    }
});

async function sendEmail(to, otp) {
    const mailOptions = {
        from: `"HeartEcho ❤️" <${process.env.EMAIL_USER}>`,
        to,
        subject: "Your HeartEcho OTP Code",
        html: `
        <div style="font-family: Arial, sans-serif; background: #f8f9fa; padding: 20px; text-align: center;">
            <div style="max-width: 500px; margin: auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
                <h2 style="color: #d84303;">🔒 Your OTP Code</h2>
                <p style="font-size: 16px; color: #333;">Use the following OTP to complete your verification for <strong>HeartEcho</strong>:</p>
                <div style="font-size: 24px; font-weight: bold; color: #d84303; padding: 10px; background: #fce4ec; border-radius: 5px; display: inline-block;">
                    ${otp}
                </div>
                <p style="font-size: 14px; color: #555;">This OTP is valid for 10 minutes. If you did not request this, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #ddd;">
                <p style="font-size: 12px; color: #888;">© 2025 HeartEcho. All rights reserved.</p>
            </div>
        </div>`
    };

    return transporter.sendMail(mailOptions);
}

module.exports = sendEmail;
