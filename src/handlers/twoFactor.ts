import * as password from '../utils/password';
import * as twoFactor from '../utils/twoFactor';
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

    const validPassword = await password.verify(model.password, user.password);
    if (!validPassword) {
        return undefined;
    }

    const verified = twoFactor.verify(
        model.verificationCode,
        user.twoFactorSecret
    );

    if (!verified) {
        return undefined;
    }

    if (user.isLockedOut) {
        return {
            isLockedOut: true
        };
    }

    return {
        user
    };
};
