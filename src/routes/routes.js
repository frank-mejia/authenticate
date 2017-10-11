'use strict';

const _ = require('lodash');
const router = require('express').Router();
const config = require('nconf');

//router.use('/password', require('./routes/password.router.js'));
//router.use('/rest', require('./routes/rest.router.js'));
router.use('/account', require('./account.router.js'));
router.use('/authenticate', require('./authenticate.router.js'));
router.use('/token', require('./token.router.js'));


module.exports = router;
