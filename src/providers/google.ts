import http from '../utils/http';
import config from '../utils/config';

const baseUrl = 'https://www.googleapis.com/oauth2/v3/tokeninfo';

export const getUser = async (accessToken: string) => {
    const url = `${baseUrl}?access_token=${accessToken}`;

    let result;
    try {
        result = await http.get(url);
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
