import { Request, Response } from 'express';
import { validators, validateRequest } from '../utils/validators';
import * as password from '../utils/password';
import * as response from '../utils/response';
import userToken from '../utils/userToken';
import email from '../utils/email';
import providers from '../providers';
import User from '../models/user';

export const register = [
    validators.emailAddress,
    validators.password,
    validators.firstName,
    validators.lastName,
    validators.dateOfBirth,
    validateRequest,
    async (req: Request, res: Response) => {
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

export const registerExternal = [
    validators.provider,
    validators.accessToken,
    validators.emailAddress,
    validators.firstName,
    validators.lastName,
    validators.dateOfBirth,
    validateRequest,
    async (req: Request, res: Response) => {
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

export const forgotPassword = [
    validators.emailAddress,
    validateRequest,
    async (req: Request, res: Response) => {
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

export const resetPassword = [
    validators.code,
    validators.emailAddress,
    validators.newPassword,
    validateRequest,
    async (req: Request, res: Response) => {
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
