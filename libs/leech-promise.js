'use strict';

const leech = require('./leech.js');

module.exports.get = function (options) {
    return new Promise(
        (resolve, reject) => {
            leech.get(options,
                (err, $) => {
                    if (err) return reject(err);
                    resolve($);
                })
        }
    )
};

module.exports.post = function (options) {
    return new Promise(
        (resolve, reject) => {
            leech.post(options,
                (err, $) => {
                    if (err) return reject(err);
                    resolve($);
                })
        }
    )
}

module.exports.retrieve = function (url, location) {
    return new Promise(
        (resolve, reject) => {
            leech.request(url, location,
                err => {
                    if (err) return reject(err);
                    resolve();
                })
        }
    )
}

module.exports.config = leech.config;
