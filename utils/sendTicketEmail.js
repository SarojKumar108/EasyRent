const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");

const sendTicketEmail = async (to, filePath) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.MAIL_USER,
    to,
    subject: "Your Booking Confirmation",
    text: "Attached is your villa booking receipt.",
    attachments: [
      {
        filename: path.basename(filePath),
        path: filePath,
      },
    ],
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendTicketEmail;
