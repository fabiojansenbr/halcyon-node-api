const nodemailer = require('nodemailer');
const format = require('string-format');
const config = require('./config');
const templates = require('../resources/templates.json');

module.exports = async message => {
    const template = templates.find(email => email.name === message.template);
    const subject = format(template.subject, message.context);
    const html = format(template.html, message.context);

    const transport = nodemailer.createTransport({
        host: config.EMAIL_HOST,
        port: config.EMAIL_PORT,
        secure: config.EMAIL_SECURE,
        auth: {
            user: config.EMAIL_USERNAME,
            pass: config.EMAIL_PASSWORD
        }
    });

    try {
        await transport.sendMail({
            from: config.EMAIL_NOREPLY,
            to: message.to,
            subject,
            html
        });
    } catch (error) {
        console.error('Email Send Failed', error);
    }
};
