import { Request, Response } from 'express';
import * as password from '../utils/password';
import config from '../utils/config';
import User from '../models/user';

export const seedData = async (req: Request, res: Response) => {
    const user = {
        emailAddress: config.SEED_EMAIL_ADDRESS,
        password: await password.hash(config.SEED_PASSWORD),
        firstName: 'System',
        lastName: 'Administrator',
        dateOfBirth: '1970-01-01',
        roles: ['System Administrator']
    };

    const existing = await User.findOne({
        emailAddress: user.emailAddress
    });

    if (existing) {
        await existing.remove();
    }

    await new User(user).save();

    return res.send('Database seeded.');
};
