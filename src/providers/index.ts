import * as facebook from './facebook';
import * as google from './google';

interface IProviderResponse {
    userId: string;
}

interface IProvider {
    getUser(accessToken: string): Promise<IProviderResponse>;
}

interface IProviderFactory {
    [key: string]: IProvider;
}

const providers: IProviderFactory = {
    Facebook: facebook,
    Google: google
};

export default providers;
