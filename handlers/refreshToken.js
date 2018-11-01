const User = require('../models/user');

module.exports.authenticate = async model => {
    const user = await User.findOne({
        'refreshTokens.token': model.refreshToken
    });

    if (!user) {
        return undefined;
    }

    if (user.isLockedOut) {
        return {
            isLockedOut: true
        };
    }

    user.refreshTokens = user.refreshTokens.filter(
        rt => rt.token !== model.refreshToken
    );

    return {
        user
    };
};
