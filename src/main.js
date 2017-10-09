'use strict';

const path = require('path');

const rootPath = path.resolve(`${__dirname}/..`);
require('app-module-path').addPath(rootPath);

const configPath = path.resolve(`${rootPath}/config`);
const config = require('nconf')
    .argv()
    .env({ lowerCase: true, separator: ':' })
    .file('environment', { file: `${configPath}/${process.env.NODE_ENV}.json` })
    .file('defaults', { file: `${configPath}/default.json` });

//const logger = require('src/util/logger.js');
const db = require('./util/db');


db.initializeWithObject(config.get('db'));


const port = config.get('port');
const app = require('./app');
db.ready().then(() => {
    app.listen(port, () => {
        //logger.core.info(`Listening on port ${port}`);
        console.log(`Listening on port ${port}`);
    });
});

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
    // application specific logging, throwing an error, or other logic here
});
