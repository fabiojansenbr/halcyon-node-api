const jwt = require('jsonwebtoken');
const config = require('./config');

module.exports = user => {
    const expiresIn = 3600;
    const payload = {
        sub: user.id,
        email: user.emailAddress,
        given_name: user.firstName, // eslint-disable-line camelcase
        family_name: user.lastName, // eslint-disable-line camelcase
        picture: user.gravatarUrl,
        role: user.roles && user.roles.join()
    };

    const accessToken = jwt.sign(payload, config.SECURITY_KEY, {
        expiresIn
    });

    const refreshToken = user.refreshTokens[user.refreshTokens.length - 1];

    return {
        accessToken,
        refreshToken,
        expiresIn
    };
};
