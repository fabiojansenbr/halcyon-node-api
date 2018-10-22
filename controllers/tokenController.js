const validationMiddleware = require('../middleware/validationMiddleware');
const validators = require('../utils/validators');
const response = require('../utils/response');
const userToken = require('../utils/userToken');
const jwt = require('../utils/jwt');
const handlers = require('../handlers');

module.exports.getToken = [
    validationMiddleware([validators.grantType]),
    async (req, res) => {
        const handler = handlers[req.body.grantType];
        if (!handler) {
            return response.generate(res, 400, [
                `Grant Type "${req.body.provider}" is not supported.`
            ]);
        }

        const result = (await handler.authenticate(req.body)) || {};

        if (result.requiresTwoFactor || result.requiresExternal) {
            return response.generate(res, 400, undefined, result);
        }

        if (result.isLockedOut) {
            return response.generate(res, 400, [
                'This account has been locked out, please try again later.'
            ]);
        }

        if (!result.user) {
            return response.generate(res, 400, [
                'The credentials provided were invalid.'
            ]);
        }

        result.user.refreshTokens.push(userToken());
        await result.user.save();

        return response.generate(res, 200, undefined, jwt(result.user));
    }
];
