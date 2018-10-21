const appInsights = require('applicationinsights');
if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
    appInsights.setup().start();
}

const express = require('express');
const cors = require('cors');
const logger = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const yaml = require('yamljs');
const config = require('./utils/config');

const notFoundMiddleware = require('./middleware/notFoundMiddleware');
const errorMiddleware = require('./middleware/errorMiddleware');

const seed = require('./routes/seed');
const account = require('./routes/account');
const token = require('./routes/token');
const manage = require('./routes/manage');
const user = require('./routes/user');

mongoose.connect(
    config.MONGODB,
    { useNewUrlParser: true }
);
mongoose.set('useCreateIndex', true);
mongoose.Promise = global.Promise;

const connection = mongoose.connection;
connection.on(
    'error',
    console.error.bind(console, 'MongoDB connection error:')
);

const app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(cors());

app.options('/api', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, Content-Length, X-Requested-With'
    );
    return res.send(200);
});

app.use('/api/account', account);
app.use('/api/token', token);
app.use('/api/manage', manage);
app.use('/api/user', user);
app.use('/seed', seed);

const swaggerDoc = yaml.load('./swagger.yml');
const options = { customSiteTitle: 'Halcyon Api' };
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDoc, options));
app.use('/$', (req, res) => res.redirect('/swagger'));

app.use(notFoundMiddleware);
app.use(errorMiddleware);

app.set('port', process.env.PORT || 3001);

const server = app.listen(app.get('port'), () => {
    console.log(`Express server listening on port ${server.address().port}`);
});
