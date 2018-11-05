import * as password from '../utils/password';
import User from '../models/user';
import { IHandlerRequest, IHandlerResponse } from '.';

export const authenticate = async (
    model: IHandlerRequest
): Promise<IHandlerResponse> => {
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
