import { Request, Response } from 'express';
import validationMiddleware from '../middleware/validationMiddleware';
import validators from '../utils/validators';
import * as response from '../utils/response';
import jwt from '../utils/jwt';
import handlers from '../handlers';

export const getToken = [
    validationMiddleware([validators.grantType]),
    async (req: Request, res: Response) => {
        const handler = handlers[req.body.grantType];
        if (!handler) {
            return response.generate(res, 400, [
                `Grant Type "${req.body.provider}" is not supported.`
            ]);
        }

        const result = (await handler.authenticate(req.body)) || {};

        if (result.requiresTwoFactor || result.requiresExternal) {
            return response.generate(res, 400, undefined, result);
        }

        if (result.isLockedOut) {
            return response.generate(res, 400, [
                'This account has been locked out, please try again later.'
            ]);
        }

        if (!result.user) {
            return response.generate(res, 400, [
                'The credentials provided were invalid.'
            ]);
        }

        const token = await jwt(result.user);
        return response.generate(res, 200, undefined, token);
    }
];
