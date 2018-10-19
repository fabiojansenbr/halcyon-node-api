const password = require('../utils/password');
const User = require('../models/user');

module.exports.authenticate = async model => {
    const user = await User.findOne({
        emailAddress: model.emailAddress
    });

    if (!user) {
        return undefined;
    }

    const valid = await password.verify(model.password, user.password);
    if (!valid) {
        return undefined;
    }

    if (user.isLockedOut || user.twoFactorEnabled) {
        return {
            isLockedOut: user.isLockedOut,
            requiresTwoFactor: user.twoFactorEnabled
        };
    }

    return {
        user
    };
};
