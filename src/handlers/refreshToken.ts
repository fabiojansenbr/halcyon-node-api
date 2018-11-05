import { IUser } from '.';
import User from '../models/user';

interface IRefreshToken {
    token: string;
    issued: Date;
}

export const authenticate = async (model: IUser) => {
    const user = await User.findOne({
        'refreshTokens.token': model.refreshToken
    });

    if (!user) {
        return undefined;
    }

    if (user.isLockedOut) {
        return {
            isLockedOut: true
        };
    }

    user.refreshTokens = user.refreshTokens.filter(
        (rt: IRefreshToken) => rt.token !== model.refreshToken
    );

    return {
        user
    };
};
