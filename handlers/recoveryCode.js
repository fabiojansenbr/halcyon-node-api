const password = require('../utils/password');
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

    if (user.isLockedOut) {
        return {
            isLockedOut: true
        };
    }

    const validCode = user.recoveryCodes.includes(model.recoveryCode);
    if (!validCode) {
        return undefined;
    }

    user.recoveryCodes = user.recoveryCodes.filter(
        recoveryCode => recoveryCode !== model.recoveryCode
    );

    return {
        user
    };
};
