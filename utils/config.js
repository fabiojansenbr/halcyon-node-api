require('dotenv/config');

module.exports = {
    MONGODB: process.env.MONGODB || 'mongodb://localhost:27017/halcyon',
    SECURITY_KEY: process.env.SECURITY_KEY || 'Z332RQz9Yjjd1IfRfv4W',
    ADMIN_EMAIL_ADDRESS: 'admin@chrispoulter.com',
    ADMIN_PASSWORD: 'Testing123',
    EMAIL_HOST: process.env.EMAIL_HOST || 'localhost',
    EMAIL_PORT: parseInt(process.env.EMAIL_PORT || '25', 10),
    EMAIL_SECURE: process.env.EMAIL_SECURE === 'true',
    EMAIL_USERNAME: process.env.EMAIL_USERNAME,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    EMAIL_NOREPLY: process.env.EMAIL_NOREPLY || 'noreply@chrispoulter.com',
    FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID,
    FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET
};
