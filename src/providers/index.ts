import * as facebook from './facebook';
import * as google from './google';

export interface IProviderResponse {
    userId: string;
}

export interface IProvider {
    getUser(accessToken: string): Promise<IProviderResponse>;
}

export interface IProviderFactory {
    [key: string]: IProvider;
}

const providers: IProviderFactory = {
    Facebook: facebook,
    Google: google
};

export default providers;
