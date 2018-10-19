module.exports.querystring = {
    getInt: (req, property, defaultValue) => {
        let value = defaultValue;
        if (req.query[property]) {
            value = parseInt(req.query[property], 10);

            if (value < 1) {
                value = defaultValue;
            }
        }

        return value;
    }
};
