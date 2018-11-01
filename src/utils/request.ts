import { Request } from 'express';

export const querystring = {
    getInt: (req: Request, property: string, defaultValue: number) => {
        let value = defaultValue;
        if (req.query[property]) {
            value = parseInt(req.query[property], 10);

            if (value < 1) {
                value = defaultValue;
            }
        }

        return value;
    }
};
