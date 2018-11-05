import jsonWebToken from 'jsonwebtoken';
import userToken from './userToken';
import config from './config';
import { IUser, IUserRefreshToken } from '../models/user';

const jwt = async (user: IUser) => {
    const expiresIn = config.JWT_EXPIRY_MINUTES * 60;

    const payload = {
        sub: user.id,
        email: user.emailAddress,
        given_name: user.firstName, // eslint-disable-line camelcase
        family_name: user.lastName, // eslint-disable-line camelcase
        picture: user.gravatarUrl,
        role: user.roles && user.roles.join()
    };

    const accessToken = jsonWebToken.sign(payload, config.JWT_SECURITY_KEY, {
        expiresIn
    });

    const refreshToken = await generateRefreshToken(user);

    return {
        accessToken,
        refreshToken,
        expiresIn
    };
};

const generateRefreshToken = async (user: IUser) => {
    user.refreshTokens = user.refreshTokens
        .sort(
            (rt1: IUserRefreshToken, rt2: IUserRefreshToken) =>
                rt1.issued.getTime() > rt2.issued.getTime() ? -1 : 1
        )
        .filter((rt: IUserRefreshToken, index: number) => index < 10);

    const refreshToken = {
        token: userToken(),
        issued: new Date()
    };

    user.refreshTokens.push(refreshToken);
    await user.save();

    return refreshToken.token;
};

export default jwt;
