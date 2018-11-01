const response = require('../utils/response');

module.exports = (err, req, res) =>
    response.generate(res, err.status || 500, [err.message]);
