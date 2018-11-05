import http from '../utils/http';
import config from '../utils/config';
import { IProviderResponse } from '.';

const baseUrl = 'https://www.googleapis.com/oauth2/v3/tokeninfo';

export interface IGoogleResponse {
    sub?: string;
    aud?: string;
}

export const getUser = async (
    accessToken: string
): Promise<IProviderResponse> => {
    const url = `${baseUrl}?access_token=${accessToken}`;

    let result;
    try {
        result = await http.get<IGoogleResponse>(url);
    } catch (error) {
        console.error('Google Get User Failed', error);
    }

    const data = result && result.data;
    const userId = data && data.sub;
    const aud = data && data.aud;

    if (!userId || aud !== config.GOOGLE_CLIENT_ID) {
        return undefined;
    }

    return {
        userId
    };
};
