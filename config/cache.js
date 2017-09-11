'use strict';

const NodeCache = require('node-cache');
const cache = new NodeCache();

function getKey (type, key) {

    if (typeof type !== 'string' || typeof key !== 'string') {
        throw new Error('Invalid argument type');
    }

    let typ = (type || "").trim();
    let ky = (key || "").trim();

    if (typ === "" || ky === "") {
        throw new Error('Invalid argument values');
    }

    return '[' + typ + ']' + ky;
}

function set (type, key, val) {
    let storeKey = getKey(type, key);
    return cache.set(storeKey, val);
}

module.exports.set = set;

function get (type, key) {
    let storeKey = getKey(type, key);
    return cache.get(storeKey);
}

module.exports.get = get;
