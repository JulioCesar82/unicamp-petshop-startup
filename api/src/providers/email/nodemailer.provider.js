const nodemailer = require('nodemailer');

const { host, port, secure, user, pass, from } = require('../../config/email');

let transporter;

function getTransporter() {
    if (!transporter) {
        if (!host || !port || !user || !pass) {
            throw new Error('Nodemailer environment variables are not configured');
        }

        transporter = nodemailer.createTransport({
            host,
            port,
            secure,
            auth: {
                user,
                pass
            }
        });
    }
    
    return transporter;
}

const sendEmail = async ({ to, subject, html }) => {
    const mailOptions = {
        from,
        to,
        subject,
        html
    };

    return getTransporter().sendMail(mailOptions);
};

module.exports = {
    send: sendEmail,
    client: nodemailer
};
