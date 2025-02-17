const nodemailer = require('nodemailer');
require('dotenv').config();
const sendSignupSuccessEmail = async (email, name) => {
    try {
        let transporter = nodemailer.createTransport({
            service: 'Gmail',  // or any email service you prefer
            auth: {
                user: process.env.mailer_email,  // Your email
                pass: process.env.mailer_passowe    // Your email password or app-specific password
            }
        });

        let mailOptions = {
            from: '"Nexus Team" <your-email@gmail.com>',
            to: email,
            subject: 'Welcome to Nexus - Signup Successful!',
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #007BFF;">Welcome to Nexus, ${name}!</h2>
                    <p>We're thrilled to have you on board. Your signup was successful, and you're now part of the Nexus community.</p>
                    <p><strong>Next Steps:</strong></p>
                    <ul>
                        <li>Explore your dashboard</li>
                        <li>Connect with your organization</li>
                        <li>Start collaborating with your team</li>
                    </ul>
                    <p>Need help? Contact our support team anytime.</p>
                    <p style="margin-top: 20px;">Cheers,<br><strong>Nexus Team</strong></p>
                    <div style="margin-top: 30px; font-size: 12px; color: #888;">
                        This is an automated email, please do not reply.
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Signup success email sent to:', email);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = sendSignupSuccessEmail;
