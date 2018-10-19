const speakeasy = require('speakeasy');

module.exports.generate = label => {
    const secret = speakeasy.generateSecret({ length: 10 });
    const authenticatorUri = speakeasy.otpauthURL({
        secret: secret.base32,
        label
    });

    return {
        secret: secret.base32,
        authenticatorUri
    };
};

module.exports.verify = (token, secret) => {
    if (!token || !secret) {
        return false;
    }

    return speakeasy.totp.verify({
        encoding: 'base32',
        token,
        secret
    });
};
