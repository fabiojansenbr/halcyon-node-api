module.exports = {
    generate: (res, status, messages, data) =>
        res.status(status).json({
            messages,
            data
        }),

    error: (res, errors) =>
        res.status(400).json({
            messages: errors.array({ onlyFirstError: true }).map(err => err.msg)
        })
};
