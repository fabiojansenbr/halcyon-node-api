const http = require('../utils/http');
const config = require('../utils/config');

const baseUrl = 'https://graph.facebook.com/v3.1/debug_token';

module.exports.getUser = async accessToken => {
    const url = `${baseUrl}?input_token=${accessToken}&access_token=${
        config.FACEBOOK_APP_ID
    }|${config.FACEBOOK_APP_SECRET}`;

    let result;
    try {
        result = await http.get(url);
    } catch (error) {
        console.error('Facebook Get User Failed', error);
    }

    if (
        !result ||
        !result.data ||
        !result.data.data ||
        !result.data.data.user_id
    ) {
        return undefined;
    }

    return {
        userId: result.data.data.user_id
    };
};
