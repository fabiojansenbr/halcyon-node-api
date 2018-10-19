const response = require('../utils/response');

module.exports = (req, res) =>
    response.generate(res, 404, ['Resource not found.']);
