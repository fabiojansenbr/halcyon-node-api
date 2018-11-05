import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator/check';
import * as response from '../utils/response';

const validationMiddlware = (validators: ValidationChain[]) => [
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
