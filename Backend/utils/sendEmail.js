const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Hardcoded credentials for reliability as requested
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for 587
    auth: {
      user: 'mullerhihi@gmail.com',
      pass: 'tyqthgmjvfdwqmal',
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });

  const mailOptions = {
    from: 'mullerhihi@gmail.com',
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  console.log(`Attempting to send email to: ${options.email} via smtp.gmail.com`);
  return transporter.sendMail(mailOptions);
};

module.exports = sendEmail;