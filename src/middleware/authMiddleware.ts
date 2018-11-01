const jwt = require('jsonwebtoken');
const response = require('../utils/response');
const config = require('../utils/config');

module.exports = requiredRoles => async (req, res, next) => {
    const token =
        req.headers.authorization &&
        req.headers.authorization.replace(/bearer /giu, '');

    if (!token) {
        return response.generate(res, 401, ['The token provided was invalid.']);
    }

    let payload;
    try {
        payload = await jwt.verify(token, config.JWT_SECURITY_KEY);
    } catch (error) {
        console.error('Verify Token Failed', error);
    }

    if (!payload) {
        return response.generate(res, 401, ['The token provided was invalid.']);
    }

    if (
        requiredRoles &&
        (!payload.role ||
            !requiredRoles.some(value => payload.role.includes(value)))
    ) {
        return response.generate(res, 403, [
            'You are not authorized to view this resource.'
        ]);
    }

    res.locals.userId = payload.sub;

    return next();
};
