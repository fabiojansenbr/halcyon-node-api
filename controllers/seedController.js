const password = require('../utils/password');
const config = require('../utils/config');
const User = require('../models/user');

module.exports.seedData = async (req, res) => {
    var user = {
        emailAddress: config.SEED_EMAIL_ADDRESS,
        password: await password.hash(config.SEED_PASSWORD),
        firstName: 'System',
        lastName: 'Administrator',
        dateOfBirth: '1970-01-01',
        roles: ['System Administrator']
    };

    const existing = await User.findOne({
        emailAddress: user.emailAddress
    });

    if (existing) {
        await existing.remove();
    }

    await new User(user).save();

    return res.send('Database seeded.');
};
