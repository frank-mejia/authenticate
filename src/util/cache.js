'use strict';

const _      = require('lodash');
const config = require('nconf');
const redis = require('redis');

const cacheConfig = config.get('cache');

if (!cacheConfig) {
    throw new Error('Cache is not configured properly.');
}

let redisClient;
redisClient = redis.createClient(cacheConfig);

const attemptJsonParse = (jsonMaybe) => {
    let val = jsonMaybe;
    try {
        val = JSON.parse(val);
    } catch (err) {
        // Value is not JSON
        // Ignore the error and send back the value
    }
    return val;
};

const Cache = {

    prepValue: (value) => {
        let val = value;
        if (!_.isString(val)) {
            val = JSON.stringify(val);
        }
        return val;
    },

    put: (key, value) => {
        return new Promise((resolve, reject) => {
            const val = Cache.prepValue(value);

            redisClient.set(key, val, (err, res) => {
                if (err) {
                    return reject(new Error(err));
                }
                resolve(res);
            });
        });
    },

    get: (key) => {
        return new Promise((resolve, reject) => {
            redisClient.get(key, (err, res) => {
                if (err) {
                    return reject(new Error(err));
                }

                resolve(attemptJsonParse(res));
            });
        });
    },

    // Promise gets resolved with the number of items deleted
    del: (key) => {
        return new Promise((resolve, reject) => {
            redisClient.del(key, (err, res) => {
                if (err) {
                    return reject(new Error(err));
                }
                resolve(res);
            });
        });
    },

    expire: (key, expiry) => {
        return new Promise((resolve, reject) => {
            redisClient.expire(key, expiry, (err) => {
                if (err) {
                    return reject(new Error(err));
                }
                return resolve();
            });
        });
    }
};

module.exports = Cache;
