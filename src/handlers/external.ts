import providers from '../providers';
import User from '../models/user';
import { IHandlerRequest } from '.';

export const authenticate = async (model: IHandlerRequest) => {
    const provider = providers[model.provider];
    if (!provider) {
        return undefined;
    }

    const externalUser = await provider.getUser(model.accessToken);
    if (!externalUser) {
        return undefined;
    }

    const user = await User.findOne({
        'logins.provider': model.provider,
        'logins.externalId': externalUser.userId
    });

    if (!user) {
        return {
            requiresExternal: true
        };
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
