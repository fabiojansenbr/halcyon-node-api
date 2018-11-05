import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator/check';
import * as response from '../utils/response';

export const validators = {
    emailAddress: body('emailAddress', 'The Email Address field is invalid.')
        .not()
        .isEmpty()
        .trim()
        .isLength({ max: 254 })
        .isEmail(),

    password: body('password', 'The Password field is invalid.')
        .not()
        .isEmpty()
        .trim()
        .isLength({
            min: 8,
            max: 50
        }),

    firstName: body('firstName', 'The First Name field is invalid.')
        .not()
        .isEmpty()
        .trim()
        .isLength({
            max: 50
        }),

    lastName: body('lastName', 'The Last Name field is invalid.')
        .not()
        .isEmpty()
        .trim()
        .isLength({
            max: 50
        }),

    dateOfBirth: body('dateOfBirth', 'The Date of Birth field is invalid.')
        .not()
        .isEmpty()
        .isISO8601(),

    currentPassword: body(
        'currentPassword',
        'The Current Password field is invalid.'
    )
        .not()
        .isEmpty(),

    newPassword: body('newPassword', 'The New Password field is invalid.')
        .not()
        .isEmpty()
        .trim()
        .isLength({
            min: 8,
            max: 50
        }),

    provider: body('provider', 'The Provider field is invalid.')
        .not()
        .isEmpty()
        .isLength({
            max: 50
        }),

    externalId: body('externalId', 'The External Id field is invalid.')
        .not()
        .isEmpty(),

    accessToken: body('accessToken', 'The Access Token field is invalid.')
        .not()
        .isEmpty(),

    code: body('code', 'The Code field is invalid.')
        .not()
        .isEmpty()
        .trim(),

    verificationCode: body(
        'verificationCode',
        'The Verification Code field is invalid.'
    )
        .not()
        .isEmpty()
        .trim(),

    refreshToken: body('refreshToken', 'The Refresh Token field is invalid.')
        .not()
        .isEmpty(),

    grantType: body('grantType', 'The Grant Type field is invalid.').isIn([
        'Password',
        'RefreshToken',
        'External',
        'TwoFactor'
    ])
};

export const validateRequest = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return response.error(res, errors);
    }

    return next();
};
