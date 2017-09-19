'use strict';

const leech = require('./leech.js');

module.exports.get = function (options) {
    return new Promise((resolve, reject) => {
        leech.get(options,
            (err, $) => {
                if (err) return reject(err);
                resolve($);
            })
    });
};

module.exports.post = function (options) {
    return new Promise((resolve, reject) => {
        leech.post(options,
            (err, $) => {
                if (err) return reject(err);
                resolve($);
            })
    });
}

module.exports.pipe = function (options) {
    return new Promise((resolve, reject) => {
        leech.pipe(options,
            err => {
                if (err) return reject(err);
                resolve(null);
            })
    });
}

module.exports.config = leech.config;
