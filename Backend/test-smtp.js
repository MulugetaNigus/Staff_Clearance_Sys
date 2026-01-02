const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const nodemailer = require('nodemailer');

console.log('--- SMTP Diagnostic Tool ---');
console.log('Host:', process.env.EMAIL_HOST);
console.log('Port:', process.env.EMAIL_PORT);
console.log('Secure:', process.env.EMAIL_SECURE);
console.log('User:', process.env.EMAIL_USERNAME);
console.log('---------------------------');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
    },
    connectionTimeout: 15000, // 15 seconds
});

console.log('Attempting to connect to SMTP server...');

transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Connection failed!');
        console.error(error);

        if (error.code === 'ETIMEDOUT') {
            console.log('\n--- Troubleshooting Tips ---');
            console.log('1. Render often blocks port 465. If you are using 465, try port 587 with EMAIL_SECURE=false.');
            console.log('2. If you are using Gmail, make sure you are using an "App Password", not your regular password.');
            console.log('3. Double check that EMAIL_HOST is correct (e.g., smtp.gmail.com).');
        }
    } else {
        console.log('✅ Server is ready to take our messages!');
    }
    process.exit();
});
