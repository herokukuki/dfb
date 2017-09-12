'use strict';

const path = require('path');
const clone = require('clone');

const { HumanInfo } = require('../libs/types.js');

const CRAWLERS = {
    "minnano-av": require('./crawlers/minnano-av.js'),

    "javmodel": require('./crawlers/javmodel.js'),
}

const SEARCH_TEMPLATE_URL = {
    "minnano-av": "http://www.minnano-av.com/search_result.php?search_scope=actress&search_word={code}",
}

const ID_TEMPLATE_URL = {
    "minnano-av": "http://www.minnano-av.com/{code}",

    "javmodel": "http://javmodel.com/jav/{code}/",
}

function prepare(crawlerName, type, params) {
    let crawler = CRAWLERS[crawlerName];
    let url = "";

    switch(type) {
        case "search":
            url = SEARCH_TEMPLATE_URL[crawlerName]
            if (params["code"])
                url = url.replace('{code}', encodeURIComponent(params["code"]));

            return { crawler, url };

        case "id":
            url = ID_TEMPLATE_URL[crawlerName]
            if (params["code"])
                url = url.replace('{code}', encodeURIComponent(params["code"]));

            return { crawler, url };
    }
}

function crawlHuman (crawler, url) {
    return crawler.crawl(url)
    .then(d => {
        if (d instanceof HumanInfo) {
            let infoids = d.names.filter(name => name.en)
            .map(name => {
                let param = name.en.split(' ');
                let infoid = param[0];

                if (param.length > 1) {
                    infoid = param[1].trim() + '-' + param[0].trim();
                }

                infoid = infoid.toLowerCase();

                return infoid;
            });

            return Promise.all(
                infoids.map(infoid => {
                    let { crawler, url } = prepare('javmodel', 'id', {
                        "code": infoid
                    });

                    return crawler.crawl(url);
                })
            ).then(results => {
                let info = clone(d);

                let names = info.names;
                let birthday = info.birthday;
                let matched = results.filter(
                    res => 
                        res != null && 
                        res.birthday === birthday &&
                        names.some(v => v.og === res.name.og)
                );
                
                if (matched.length > 0) {
                    let dd = matched[0];
                    if (dd.photos.length > 0) {
                        info.photos = dd.photos;
                    }

                    if (dd.tags.length > 0) {
                        info.tags = dd.tags;
                    }
                }
                
                return info;
            });
        } else {
            return d;
        }
    });
}

function crawl (type, code) {
    switch (type) {
        case "human":
            // get crawler
            var { crawler, url } = prepare('minnano-av', 'search', {
                "code": code
            });

            return crawlHuman(crawler, url);

        case "human-id":
            // get crawler
            var { crawler, url } = prepare('minnano-av', 'id', {
                "code": code
            });

            return crawlHuman(crawler, url);
        
        default:
            throw new Error('No crawler has found!');
    }
}

module.exports.crawl = crawl;
