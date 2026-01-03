const sendEmail = require('./utils/sendEmail');

const testEmail = async () => {
    try {
        console.log('Starting email test...');
        const result = await sendEmail({
            email: 'mullerhihi@gmail.com', // Sending to self for testing
            subject: 'Test Email from Debug Script',
            message: '<h1>It works!</h1><p>This is a test email.</p>'
        });
        console.log('Email sent successfully:', result);
    } catch (error) {
        console.error('Email sending failed:', error);
    }
};

testEmail();
