'use strict';

const leech = require('./leech.js');

module.exports.request = function (url) {
    return new Promise(
        (resolve, reject) => {
            leech.request(url,
                (err, $) => {
                    if (err) return reject(err);
                    resolve($);
                })
        }
    )
};

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
