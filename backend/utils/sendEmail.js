const axios = require('axios');

const sendEmail = async (to, subject, text) => {
    try {
        const response = await axios.post(
            'https://api.brevo.com/v3/smtp/email',
            {
                sender: {
                    name: "Modest Blooming",
                    email: process.env.EMAIL_USER // your verified sender email
                },
                to: [
                    { email: to }
                ],
                subject: subject,
                textContent: text
            },
            {
                headers: {
                    'api-key': process.env.BREVO_API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data;
    } catch (err) {
        console.error("Error sending email via Brevo API:", err.response?.data || err.message);
        throw err;
    }
};

module.exports = sendEmail;