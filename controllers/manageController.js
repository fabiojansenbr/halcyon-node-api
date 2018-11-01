const validationMiddleware = require('../middleware/validationMiddleware');
const validators = require('../utils/validators');
const password = require('../utils/password');
const twoFactor = require('../utils/twoFactor');
const response = require('../utils/response');
const userToken = require('../utils/userToken');
const email = require('../utils/email');
const providers = require('../providers');
const User = require('../models/user');

module.exports.getProfile = async (req, res) => {
    const user = await User.findById(res.locals.userId);
    if (!user) {
        return response.generate(res, 404, ['User not found.']);
    }

    return response.generate(res, 200, undefined, {
        emailAddress: user.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        dateOfBirth: user.dateOfBirth,
        hasPassword: !!user.password,
        emailConfirmed: user.emailConfirmed,
        twoFactorEnabled: user.twoFactorEnabled,
        gravatarUrl: user.gravatarUrl,
        logins: user.logins.map(login => ({
            provider: login.provider,
            externalId: login.externalId
        }))
    });
};

module.exports.updateProfile = [
    validationMiddleware([
        validators.emailAddress,
        validators.firstName,
        validators.lastName,
        validators.dateOfBirth
    ]),
    async (req, res) => {
        const user = await User.findById(res.locals.userId);
        if (!user) {
            return response.generate(res, 404, ['User not found.']);
        }

        if (req.body.emailAddress !== user.emailAddress) {
            const existing = await User.findOne({
                emailAddress: req.body.emailAddress
            });

            if (existing) {
                return response.generate(res, 400, [
                    `User name "${req.body.emailAddress}" is already taken.`
                ]);
            }

            user.emailConfirmed = undefined;
            user.verifyEmailToken = undefined;
        }

        user.emailAddress = req.body.emailAddress;
        user.firstName = req.body.firstName;
        user.lastName = req.body.lastName;
        user.dateOfBirth = req.body.dateOfBirth;
        await user.save();

        return response.generate(res, 200, ['Your profile has been updated.']);
    }
];

module.exports.verifyEmail = async (req, res) => {
    const user = await User.findById(res.locals.userId);
    if (!user) {
        return response.generate(res, 404, ['User not found.']);
    }

    if (user.emailConfirmed) {
        return response.generate(res, 400, [
            'Your email address has already been verified.'
        ]);
    }

    user.verifyEmailToken = userToken();
    await user.save();

    await email({
        to: user.emailAddress,
        template: 'verifyEmail',
        context: {
            code: user.verifyEmailToken
        }
    });

    return response.generate(res, 200, [
        'Instructions as to how to verify your email address have been sent to you via email.'
    ]);
};

module.exports.confirmEmail = [
    validationMiddleware([validators.code]),
    async (req, res) => {
        const user = await User.findById(res.locals.userId);
        if (!user) {
            return response.generate(res, 404, ['User not found.']);
        }

        if (req.body.code !== user.verifyEmailToken) {
            return response.generate(res, 400, ['Invalid token.']);
        }

        user.emailConfirmed = true;
        user.verifyEmailToken = undefined;
        await user.save();

        return response.generate(res, 200, [
            'Your email address has been verified.'
        ]);
    }
];

module.exports.setPassword = [
    validationMiddleware([validators.newPassword]),
    async (req, res) => {
        const user = await User.findById(res.locals.userId);
        if (!user) {
            return response.generate(res, 404, ['User not found.']);
        }

        if (user.password) {
            return response.generate(res, 400, [
                'User already has a password set.'
            ]);
        }

        user.password = await password.hash(req.body.newPassword);
        user.passwordResetToken = undefined;
        await user.save();

        return response.generate(res, 200, ['Your password has been set.']);
    }
];

module.exports.changePassword = [
    validationMiddleware([validators.currentPassword, validators.newPassword]),
    async (req, res) => {
        const user = await User.findById(res.locals.userId);
        if (!user) {
            return response.generate(res, 404, ['User not found.']);
        }

        const valid = await password.verify(
            req.body.currentPassword,
            user.password
        );

        if (!valid) {
            return response.generate(res, 400, ['Incorrect password.']);
        }

        user.password = await password.hash(req.body.newPassword);
        user.passwordResetToken = undefined;
        await user.save();

        return response.generate(res, 200, ['Your password has been changed.']);
    }
];

module.exports.addLogin = [
    validationMiddleware([validators.provider, validators.accessToken]),
    async (req, res) => {
        const user = await User.findById(res.locals.userId);
        if (!user) {
            return response.generate(res, 404, ['User not found.']);
        }

        const provider = providers[req.body.provider];
        if (!provider) {
            return response.generate(res, 400, [
                `Provider "${req.body.provider}" is not supported.`
            ]);
        }

        const externalUser = await provider.getUser(req.body.accessToken);
        if (!externalUser) {
            return response.generate(res, 400, [
                'The credentials provided were invalid.'
            ]);
        }

        const existing = await User.findOne({
            'logins.provider': req.body.provider,
            'logins.externalId': externalUser.userId
        });

        if (existing) {
            return response.generate(res, 400, [
                'A user with this login already exists.'
            ]);
        }

        user.logins.push({
            provider: req.body.provider,
            externalId: externalUser.userId
        });

        await user.save();

        return response.generate(res, 200, [
            `${req.body.provider} login added.`
        ]);
    }
];

module.exports.removeLogin = [
    validationMiddleware([validators.provider, validators.externalId]),
    async (req, res) => {
        const user = await User.findById(res.locals.userId);
        if (!user) {
            return response.generate(res, 404, ['User not found.']);
        }

        user.logins = user.logins.filter(
            login =>
                login.provder !== req.body.provider &&
                login.externalId !== req.body.externalId
        );
        await user.save();

        return response.generate(res, 200, [
            `${req.body.provider} login removed.`
        ]);
    }
];

module.exports.getTwoFactorConfig = async (req, res) => {
    const user = await User.findById(res.locals.userId);
    if (!user) {
        return response.generate(res, 404, ['User not found.']);
    }

    const result = twoFactor.generate(`Halcyon (${user.emailAddress})`);

    user.twoFactorTempSecret = result.secret;
    await user.save();

    return response.generate(res, 200, undefined, result);
};

module.exports.enableTwoFactor = [
    validationMiddleware([validators.verificationCode]),
    async (req, res) => {
        const user = await User.findById(res.locals.userId);
        if (!user) {
            return response.generate(res, 404, ['User not found.']);
        }

        const verified = twoFactor.verify(
            req.body.verificationCode,
            user.twoFactorTempSecret
        );

        if (!verified) {
            return response.generate(res, 400, [
                'Verification with authenticator app was unsuccessful.'
            ]);
        }

        user.twoFactorEnabled = true;
        user.twoFactorSecret = `${user.twoFactorTempSecret}`;
        user.twoFactorTempSecret = undefined;

        await user.save();

        return response.generate(res, 200, [
            'Two factor authentication has been enabled.'
        ]);
    }
];

module.exports.disableTwoFactor = async (req, res) => {
    const user = await User.findById(res.locals.userId);
    if (!user) {
        return response.generate(res, 404, ['User not found.']);
    }

    user.twoFactorEnabled = undefined;
    user.twoFactorSecret = undefined;
    await user.save();

    return response.generate(res, 200, [
        'Two factor authentication has been disabled.'
    ]);
};

module.exports.deleteAccount = async (req, res) => {
    const user = await User.findById(res.locals.userId);
    if (!user) {
        return response.generate(res, 404, ['User not found.']);
    }

    await user.remove();

    return response.generate(res, 200, ['Your account has been deleted.']);
};
