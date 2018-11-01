const { validationResult } = require('express-validator/check');
const response = require('../utils/response');

module.exports = validators => [
    validators,
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return response.error(res, errors);
        }

        return next();
    }
];
