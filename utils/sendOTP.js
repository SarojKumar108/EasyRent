const nodemailer = require("nodemailer");

const sendOTP = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Booking OTP - EasyRent",
      text: `Your OTP for booking confirmation is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ OTP sent successfully");
  } catch (err) {
    console.error("❌ OTP sending failed:", err);
    throw err; // propagate so your route sees failure
  }
};

module.exports = sendOTP;
