'use strict';

const fs = require('fs');
const path = require('path');
const { parse } = require('url');

const httpRequest = require('request');
const iconv = require('iconv-lite');
const cheerio = require('cheerio');

const sanitize = require("sanitize-filename");

const GET = 'GET';

const POST = 'POST';

const HEADERS = {
    "User-Agent":                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36",
    "Accept":                    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language":           "en,vi;q=0.8",
    "Accept-Encoding":           "gzip, deflate",
    "Connection":                "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Pragma":                    "no-cache",
    "Cache-control":             "no-cache",
}

var PROXY = "";

function formatFilename (filename) {
    if (filename === '') {
        return '';
    }

    var name = filename.substring(0, filename.lastIndexOf('.'));
    var ext = path.extname(filename);
    var i = ext.indexOf('?')
    if (i > 0) {
        filename = name + ext.substring(0, i);
    }

    return sanitize(filename, {
        replacement: "_"
    });
}

function enableProxy (proxyURL) {

    if (typeof proxyURL === 'string' && proxyURL != '') {
        PROXY = proxyURL        
    } else {
        PROXY = "http://127.0.0.1:9666";
    }
}

function disableProxy () {
    PROXY = "";
}

module.exports.config = {};
module.exports.config.enableProxy = enableProxy;
module.exports.config.disableProxy = disableProxy;

function prepare (args) {
    let reqObj = {
        headers: HEADERS
    };

    if (PROXY !== "" && typeof PROXY == 'string') {
        reqObj.proxy = PROXY;
    }

    for (let key in args) {
        reqObj[key] = args[key];
    }

    return reqObj;
}

function request (args, callback) {

    let fn = (err, data) => {
        if (err) throw err;
        return data;
    }

    if (callback) {
        fn = callback;
    }

    httpRequest(args, (err, res, body) => {
        
        if (err) {
            return fn(err, null);
        }

        if (res.statusCode !== 200) {
            return fn(new Error("HTTP Code " + res.statusCode), null);
        }

        var charset = (function getCharSet(contentType) {
            var i = contentType.indexOf("charset=");
            if (i > -1) {
                return contentType.substring(i + "charset=".length, contentType.length);
            }
            else {
                return null;
            }

        })(res.headers["content-type"]);

        var data = "";

        if (charset == null) {
            data = iconv.decode(body, "utf8");
        }
        else {
            if (charset.toUpperCase() === "EUC-JP") {
                data = iconv.decode(body, "euc-jp");
            }
            else {
                data = iconv.decode(body, "utf8");
            }
        }

        fn(null, data);        
    })
}

function get (url, callback) {

    let args = prepare({
        url: url,
        method: GET,
        encoding: null
    });

    let fn = (err, data) => {
        if (err) throw err;
        return data;
    }

    if (callback) {
        fn = callback;
    }

    request(args, (err, data) => {
        
        if (err) {
            return fn(err, null);
        }

        try {
            var $ = cheerio.load(data, { decodeEntities: false });
            return fn(null, $);
        } catch (ex) {
            return fn(ex, null);
        }
    })
}

module.exports.get = get;

function post (url, options, callback) {

    let bdObj = {};
    bdObj.json = options.json || false;
    bdObj.form = options.form || {};
    bdObj.body = options.body || {};

    let args = prepare({
        url: url,
        method: POST,
        encoding: null,
        json: bdObj.json,
        form: bdObj.form,
        body: bdObj.body,
    });

    let fn = (err, data) => {
        if (err) throw err;
        return data;
    }

    if (callback) {
        fn = callback;
    }

    request(args, (err, data) => {
        
        if (err) {
            return fn(err, null);
        }

        try {
            var $ = cheerio.load(data, { decodeEntities: false });
            return fn(null, $);
        } catch (ex) {
            return fn(ex, null);
        }
    })
}

module.exports.post = post;

function retrieve (url, location, callback) {
    
    if (!callback) {
        callback = err => {
            if (err) throw err;
        }
    }

    fs.exists(location, exist1 => {

        if (exist1) {
            var parsedUrl = parse(url)
            , tmp = parsedUrl.path.split('/')
            , filename = formatFilename(tmp[tmp.length - 1]);

            var filepath = path.join(location, filename);
        
            fs.exists(filepath, exist2 => {
        
                if (exist2) {
                    return callback(new Error('File existed: ' + filepath));
                } else {
                    
                    var requestOpt = makeRequest(url);
        
                    httpRequest(requestOpt)
                        .pipe(fs.createWriteStream(filepath))
                        .on('finish', () => callback(null))
                        .on('error', err => callback(err));
                }
            });     
        } else {
            return callback(new Error('Location is not exist: ' + location));
        }
    });
}

module.exports.retrieve = retrieve;
