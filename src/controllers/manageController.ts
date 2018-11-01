import { Request, Response } from 'express';
import validationMiddleware from '../middleware/validationMiddleware';
import validators from '../utils/validators';
import * as password from '../utils/password';
import * as twoFactor from '../utils/twoFactor';
import * as response from '../utils/response';
import userToken from '../utils/userToken';
import email from '../utils/email';
import providers from '../providers';
import User from '../models/user';

export const getProfile = async (req: Request, res: Response) => {
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

export const updateProfile = [
    validationMiddleware([
        validators.emailAddress,
        validators.firstName,
        validators.lastName,
        validators.dateOfBirth
    ]),
    async (req: Request, res: Response) => {
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

export const verifyEmail = async (req: Request, res: Response) => {
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

export const confirmEmail = [
    validationMiddleware([validators.code]),
    async (req: Request, res: Response) => {
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

export const setPassword = [
    validationMiddleware([validators.newPassword]),
    async (req: Request, res: Response) => {
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

export const changePassword = [
    validationMiddleware([validators.currentPassword, validators.newPassword]),
    async (req: Request, res: Response) => {
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

export const addLogin = [
    validationMiddleware([validators.provider, validators.accessToken]),
    async (req: Request, res: Response) => {
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

export const removeLogin = [
    validationMiddleware([validators.provider, validators.externalId]),
    async (req: Request, res: Response) => {
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

export const getTwoFactorConfig = async (req: Request, res: Response) => {
    const user = await User.findById(res.locals.userId);
    if (!user) {
        return response.generate(res, 404, ['User not found.']);
    }

    const result = twoFactor.generate(`Halcyon (${user.emailAddress})`);

    user.twoFactorTempSecret = result.secret;
    await user.save();

    return response.generate(res, 200, undefined, result);
};

export const enableTwoFactor = [
    validationMiddleware([validators.verificationCode]),
    async (req: Request, res: Response) => {
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

export const disableTwoFactor = async (req: Request, res: Response) => {
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

export const deleteAccount = async (req: Request, res: Response) => {
    const user = await User.findById(res.locals.userId);
    if (!user) {
        return response.generate(res, 404, ['User not found.']);
    }

    await user.remove();

    return response.generate(res, 200, ['Your account has been deleted.']);
};
