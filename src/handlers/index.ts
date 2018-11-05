import * as password from './password';
import * as refreshToken from './refreshToken';
import * as external from './external';
import * as twoFactor from './twoFactor';
import { IUser } from '../models/user';

export interface IHandlerRequest {
    emailAddress?: string;
    password?: string;
    provider?: string;
    accessToken?: string;
    refreshToken?: string;
    verificationCode?: string;
}

export interface IHandlerResponse {
    user?: IUser;
    isLockedOut?: boolean;
    requiresTwoFactor?: boolean;
    requiresExternal?: boolean;
}

export interface IHandler {
    authenticate(model: IHandlerRequest): Promise<IHandlerResponse>;
}

export interface IHandlerFactory {
    [key: string]: IHandler;
}

const handlers: IHandlerFactory = {
    Password: password,
    RefreshToken: refreshToken,
    External: external,
    TwoFactor: twoFactor
};

export default handlers;
