import { Response } from 'express';
import { Result } from 'express-validator/check';

export const generate = (
    res: Response,
    status: number,
    messages: string[],
    data?: {}
) =>
    res.status(status).json({
        messages,
        data
    });

export const error = (res: Response, errors: Result) =>
    res.status(400).json({
        messages: errors.array({ onlyFirstError: true }).map(err => err.msg)
    });
