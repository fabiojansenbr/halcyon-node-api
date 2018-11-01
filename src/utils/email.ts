import nodemailer from 'nodemailer';
import format from 'string-format';
import config from './config';
import * as templates from '../resources/templates.json';

interface IMessage {
    to: string;
    template: string;
    context: {};
}

const email = async (message: IMessage) => {
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

export default email;
