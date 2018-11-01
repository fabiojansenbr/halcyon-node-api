const jwt = require('jsonwebtoken');
const userToken = require('./userToken');
const config = require('./config');

module.exports = async user => {
    const expiresIn = config.JWT_EXPIRY_MINUTES * 60;

    const payload = {
        sub: user.id,
        email: user.emailAddress,
        given_name: user.firstName, // eslint-disable-line camelcase
        family_name: user.lastName, // eslint-disable-line camelcase
        picture: user.gravatarUrl,
        role: user.roles && user.roles.join()
    };

    const accessToken = jwt.sign(payload, config.JWT_SECURITY_KEY, {
        expiresIn
    });

    const refreshToken = await generateRefreshToken(user);

    return {
        accessToken,
        refreshToken,
        expiresIn
    };
};

const generateRefreshToken = async user => {
    user.refreshTokens = user.refreshTokens
        .sort((a, b) => (a.issued.getTime() > b.issued.getTime() ? -1 : 1))
        .filter((_, index) => index < 10);

    const refreshToken = {
        token: userToken(),
        issued: new Date()
    };

    user.refreshTokens.push(refreshToken);
    await user.save();

    return refreshToken.token;
};
