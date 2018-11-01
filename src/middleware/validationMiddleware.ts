import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator/check';
import * as response from '../utils/response';

const validationMiddlware = validators => [
    validators,
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return response.error(res, errors);
        }

        return next();
    }
];

export default validationMiddlware;
