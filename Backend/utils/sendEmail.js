const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Check for environment variables first, then fall back to hardcoded (or empty string if safer)
  // NOTE: In production, hardcoded credentials should be removed entirely.
  const emailConfig = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true' || process.env.EMAIL_PORT === '465', // auto-enable secure for port 465
    auth: {
      user: process.env.EMAIL_USERNAME || 'mullerhihi@gmail.com',
      pass: process.env.EMAIL_PASSWORD || 'tyqthgmjvfdwqmal',
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  };

  // DEBUG LOGGING: Print config (masking password)
  console.log('--- EMAIL CONFIGURATION DEBUG ---');
  console.log('Host:', emailConfig.host);
  console.log('Port:', emailConfig.port);
  console.log('Secure:', emailConfig.secure);
  console.log('User:', emailConfig.auth.user);
  console.log('Pass:', emailConfig.auth.pass ? '****** (Set)' : '(Not Set)');
  console.log('---------------------------------');

  const transporter = nodemailer.createTransport(emailConfig);

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'mullerhihi@gmail.com',
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  console.log(`Attempting to send email to: ${options.email} via ${emailConfig.host}`);
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('CRITICAL: Email sending failed!');
    console.error('Error details:', error);
    throw error;
  }
};

module.exports = sendEmail;