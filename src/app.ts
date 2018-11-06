import * as appInsights from 'applicationinsights';
if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
    appInsights.setup().start();
}

import express, { Request, Response } from 'express';
import cors from 'cors';
import logger from 'morgan';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import yaml from 'yamljs';
import config from './utils/config';

import * as errorMiddleware from './middleware/errorMiddleware';

import seed from './routes/seed';
import account from './routes/account';
import token from './routes/token';
import manage from './routes/manage';
import user from './routes/user';

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

app.options('/api', (req: Request, res: Response) => {
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
app.use('/$', (req: Request, res: Response) => res.redirect(301, '/swagger/'));

app.use(errorMiddleware.notFound);
app.use(errorMiddleware.error);

app.set('port', process.env.PORT || 3001);

export default app;
