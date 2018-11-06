import { Request, Response } from 'express';
import * as response from '../utils/response';

export interface IError {
    status?: number;
    message?: string;
}

export const error = (err: IError, req: Request, res: Response) =>
    response.generate(res, err.status || 500, [err.message]);

export const notFound = (req: Request, res: Response) =>
    response.generate(res, 404, ['Resource not found.']);
