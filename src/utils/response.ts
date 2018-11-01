import { Request, Response } from 'express';

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

export const error = (res: Response, errors) =>
    res.status(400).json({
        messages: errors.array({ onlyFirstError: true }).map(err => err.msg)
    });
