import { Request, Response, NextFunction } from 'express';
import jsonWebToken from 'jsonwebtoken';
import * as response from '../utils/response';
import config from '../utils/config';

interface IPayload {
    sub: string;
    role?: string[];
}

const authorize = (requiredRoles?: string[]) => async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token =
        req.headers.authorization &&
        req.headers.authorization.replace(/bearer /giu, '');

    if (!token) {
        return response.generate(res, 401, ['The token provided was invalid.']);
    }

    let payload: IPayload;
    try {
        payload = (await jsonWebToken.verify(
            token,
            config.JWT_SECURITY_KEY
        )) as IPayload;
    } catch (error) {
        console.error('Verify Token Failed', error);
    }

    if (!payload) {
        return response.generate(res, 401, ['The token provided was invalid.']);
    }

    if (
        requiredRoles &&
        (!payload.role ||
            !requiredRoles.some(value => payload.role.includes(value)))
    ) {
        return response.generate(res, 403, [
            'You are not authorized to view this resource.'
        ]);
    }

    res.locals.userId = payload.sub;

    return next();
};

export default authorize;
