const nodemailer = require('nodemailer');

console.log('--- SMTP Full Test (Sending Email) ---');

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
});

const mailOptions = {
    from: 'mullerhihi@gmail.com',
    to: 'mullerhihi@gmail.com',
    subject: 'Test Email from Teacher Clearance System',
    html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
      <h2 style="color: #4CAF50;">SMTP Test Successful!</h2>
      <p>This is a test email sent from your <strong>test-smtp.js</strong> script.</p>
      <p>If you are reading this, it means your hardcoded credentials are working perfectly!</p>
      <p>Timestamp: ${new Date().toLocaleString()}</p>
    </div>
  `,
};

console.log('Attempting to send test email...');

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.error('❌ Failed to send email!');
        console.error(error);
    } else {
        console.log('✅ Email sent successfully!');
        console.log('Response:', info.response);
        console.log('Message ID:', info.messageId);
        console.log('\nPlease check your inbox at mullerhihi@gmail.com');
    }
    process.exit();
});
