const password = require('./password');
const refreshToken = require('./refreshToken');
const external = require('./external');
const twoFactor = require('./twoFactor');

module.exports = {
    Password: password,
    RefreshToken: refreshToken,
    External: external,
    TwoFactor: twoFactor
};
