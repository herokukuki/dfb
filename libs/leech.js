'use strict';

const fs = require('fs');
const path = require('path');
const { parse } = require('url');

const request = require('request');
const iconv = require('iconv-lite');
const cheerio = require('cheerio');

const sanitize = require("sanitize-filename");

const HEADERS = {
    "User-Agent":                "Mozilla/5.0 (Windows NT 10.0; WOW64; rv:55.0) Gecko/20100101 Firefox/55.0",
    "Accept":                    "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language":           "en-US;q=0.5,en;q=0.3",
    "Accept-Encoding":           "gzip, deflate",
    "DNT":                       "1",
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

function makeRequest (url) {

    var info = {
        url: url,
        headers: HEADERS
    };

    if (PROXY !== "" && typeof PROXY == 'string') {
        info.proxy = PROXY;
    }

    return info
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

function doRequest (url, callback) {

    var requestOpt = makeRequest(url);
    requestOpt.encoding = null;

    request(requestOpt, (err, res, body) => {

        if (!callback) {
            callback = (err, $) => {
                if (err) throw err;
                return $;
            }
        }

        if (err) {
            return callback(err, null);
        }

        if (res.statusCode !== 200) {
            return callback(new Error("HTTP Code " + res.statusCode), null);
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

        try {
            var $ = cheerio.load(data, { decodeEntities: false });
            return callback(null, $);
        } catch (ex) {
            return callback(ex, null);
        }
        
    })
}

module.exports.request = doRequest;

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
        
                    request(requestOpt)
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
