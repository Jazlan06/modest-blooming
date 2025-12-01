require('dotenv').config();
const sendEmail = require('./utils/sendEmail');

(async () => {
    try {
        await sendEmail('jazlannaik4@gmail.com', 'Test Email', 'Hello from Brevo API!');
        console.log('Email sent successfully!');
    } catch (err) {
        console.error('Error sending email:', err);
    }
})();
