const bcrypt = require('bcryptjs');

module.exports.hash = password => bcrypt.hash(password, 10);

module.exports.verify = (password, hash) => {
    if (!password || !hash) {
        return false;
    }

    return bcrypt.compare(password, hash);
};
