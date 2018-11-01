const password = require('../utils/password');
const twoFactor = require('../utils/twoFactor');
const User = require('../models/user');

module.exports.authenticate = async model => {
    const user = await User.findOne({
        emailAddress: model.emailAddress
    });

    if (!user) {
        return undefined;
    }

    const validPassword = await password.verify(model.password, user.password);
    if (!validPassword) {
        return undefined;
    }

    const verified = twoFactor.verify(
        model.verificationCode,
        user.twoFactorSecret
    );

    if (!verified) {
        return undefined;
    }

    if (user.isLockedOut) {
        return {
            isLockedOut: true
        };
    }

    return {
        user
    };
};
