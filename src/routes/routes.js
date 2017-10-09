'use strict';

const _ = require('lodash');
const router = require('express').Router();
const config = require('nconf');

//router.use('/password', require('./routes/password.router.js'));
//router.use('/rest', require('./routes/rest.router.js'));

// Development endpoint to quickly check what spec is deployed
router.get('/',
    (req, res) => {

        if (config.get('NODE_ENV') === 'production') {
            return res.status(404).send({
                message: 'The requested resource does not exist.',
                resource: `${req.method} ${req.path}`,
            });
        }

        if (!_.isUndefined(req.query.pretty)) {
            return res
                .header('Content-Type','application/json')
                .send(JSON.stringify(require('./spec/app.spec.js'), null, 4));
        }
        return res.json(require('./spec/app.spec.js'));
    }
);

module.exports = router;
