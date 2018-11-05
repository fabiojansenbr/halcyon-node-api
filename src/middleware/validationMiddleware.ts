import { Request, Response, NextFunction, RequestHandler } from 'express';
import { validationResult, ValidationChain } from 'express-validator/check';
import * as response from '../utils/response';

const validationMiddlware = (validators: ValidationChain[]) => (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    validators.forEach(validator => validator(req, res, next));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return response.error(res, errors);
    }

    return next();
};

export default validationMiddlware;
