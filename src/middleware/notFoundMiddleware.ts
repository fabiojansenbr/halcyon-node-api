import { Request, Response } from 'express';
import * as response from '../utils/response';

const notFoundMiddleware = (req: Request, res: Response) =>
    response.generate(res, 404, ['Resource not found.']);

export default notFoundMiddleware;
