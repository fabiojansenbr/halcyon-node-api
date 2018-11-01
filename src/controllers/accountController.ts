const validationMiddleware = require('../middleware/validationMiddleware');
const password = require('../utils/password');
const validators = require('../utils/validators');
const response = require('../utils/response');
const userToken = require('../utils/userToken');
const email = require('../utils/email');
const providers = require('../providers');
const User = require('../models/user');

module.exports.register = [
    validationMiddleware([
        validators.emailAddress,
        validators.password,
        validators.firstName,
        validators.lastName,
        validators.dateOfBirth
    ]),
    async (req, res) => {
        const existing = await User.findOne({
            emailAddress: req.body.emailAddress
        });

        if (existing) {
            return response.generate(res, 400, [
                `User name "${req.body.emailAddress}" is already taken.`
            ]);
        }

        const user = new User({
            emailAddress: req.body.emailAddress,
            password: await password.hash(req.body.password),
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            dateOfBirth: req.body.dateOfBirth,
            verifyEmailToken: userToken()
        });

        await user.save();

        await email({
            to: user.emailAddress,
            template: 'verifyEmail',
            context: {
                code: user.verifyEmailToken
            }
        });

        return response.generate(res, 200, ['User successfully registered.']);
    }
];

module.exports.registerExternal = [
    validationMiddleware([
        validators.provider,
        validators.accessToken,
        validators.emailAddress,
        validators.firstName,
        validators.lastName,
        validators.dateOfBirth
    ]),
    async (req, res) => {
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

        const existing = await User.findOne().or([
            {
                'logins.provider': req.body.provider,
                'logins.externalId': externalUser.userId
            },
            { emailAddress: req.body.emailAddress }
        ]);

        if (existing) {
            const message =
                existing.emailAddress === req.body.emailAddress
                    ? `User name "${req.body.emailAddress}" is already taken.`
                    : 'A user with this login already exists.';

            return response.generate(res, 400, [message]);
        }

        const user = new User({
            emailAddress: req.body.emailAddress,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            dateOfBirth: req.body.dateOfBirth,
            logins: [
                {
                    provider: req.body.provider,
                    externalId: externalUser.userId
                }
            ]
        });

        await user.save();

        return response.generate(res, 200, ['User successfully registered.']);
    }
];

module.exports.forgotPassword = [
    validationMiddleware([validators.emailAddress]),
    async (req, res) => {
        const user = await User.findOne({
            emailAddress: req.body.emailAddress
        });

        if (user) {
            user.passwordResetToken = userToken();
            await user.save();

            await email({
                to: user.emailAddress,
                template: 'resetPassword',
                context: {
                    code: user.passwordResetToken
                }
            });
        }

        return response.generate(res, 200, [
            'Instructions as to how to reset your password have been sent to you via email.'
        ]);
    }
];

module.exports.resetPassword = [
    validationMiddleware([
        validators.code,
        validators.emailAddress,
        validators.newPassword
    ]),
    async (req, res) => {
        const user = await User.findOne({
            emailAddress: req.body.emailAddress
        });

        if (!user || user.passwordResetToken !== req.body.code) {
            return response.generate(res, 400, ['Invalid token.']);
        }

        user.password = await password.hash(req.body.newPassword);
        user.passwordResetToken = undefined;
        user.twoFactorEnabled = undefined;
        user.twoFactorSecret = undefined;
        await user.save();

        return response.generate(res, 200, ['Your password has been reset.']);
    }
];
