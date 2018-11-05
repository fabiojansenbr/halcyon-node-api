import User from '../models/user';
import { IHandlerRequest, IHandlerResponse } from '.';

export const authenticate = async (
    model: IHandlerRequest
): Promise<IHandlerResponse> => {
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
        rt => rt.token !== model.refreshToken
    );

    return {
        user
    };
};
