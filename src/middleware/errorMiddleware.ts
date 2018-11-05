import { Request, Response } from 'express';
import * as response from '../utils/response';

export interface IError {
    status?: number;
    message?: string;
}

const errorMiddleware = (err: IError, req: Request, res: Response) =>
    response.generate(res, err.status || 500, [err.message]);

export default errorMiddleware;
