import * as password from '../utils/password';
import { IUser } from '.';
import User from '../models/user';

export const authenticate = async (model: IUser) => {
    const user = await User.findOne({
        emailAddress: model.emailAddress
    });

    if (!user) {
        return undefined;
    }

    const valid = await password.verify(model.password, user.password);
    if (!valid) {
        return undefined;
    }

    if (user.isLockedOut || user.twoFactorEnabled) {
        return {
            isLockedOut: user.isLockedOut,
            requiresTwoFactor: user.twoFactorEnabled
        };
    }

    return {
        user
    };
};
