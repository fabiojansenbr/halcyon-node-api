const password = require('../utils/password');
const config = require('../utils/config');
const User = require('../models/user');

exports.seedData = async (req, res) => {
    var administrator = {
        emailAddress: config.SEED_EMAIL_ADDRESS,
        password: config.SEED_PASSWORD,
        firstName: 'System',
        lastName: 'Administrator',
        dateOfBirth: '1970-01-01',
        roles: ['System Administrator']
    };

    const existing = await User.findOne({
        emailAddress: administrator.emailAddress
    });

    if (existing) {
        await existing.remove();
    }

    const newPassword = await password.hash(administrator.password);

    const newUser = new User(administrator);
    newUser.password = newPassword;
    await newUser.save();

    return res.send('Database seeded.');
};
