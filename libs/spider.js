'use strict';

const path = require('path');

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
        case "id":
            url = ID_TEMPLATE_URL[crawlerName]
            if (params["code"])
                url = url.replace('{code}', encodeURIComponent(params["code"]));
    }

    return { crawler, url };
}

function crawlHuman (crawler, url) {
    return crawler.crawl(url)
    .then(d => {
        if (d instanceof HumanInfo) {
            var param = d.transname.split('/')[1].trim().split(' ');
            
            var infoid = param[0];
            if (param.length > 1) {
                infoid = param[1].trim() + '-' + param[0].trim();
            }
            infoid = infoid.toLowerCase();

            // get crawler
            let { crawler, url } = prepare('javmodel', 'id', {
                "code": encodeURIComponent(infoid)
            });

            return crawler.crawl(url)
            .then(dd => {
                if (dd != null) {
                    if (dd.photos.length > 0) {
                        d.photos = dd.photos;
                    }

                    if (dd.tags.length > 0) {
                        d.tags = dd.tags;
                    }
                }
                
                return d;
            });
        }
    });
}

function crawl (type, code) {
    switch (type) {
        case "human":
            // get crawler
            var { crawler, url } = prepare('minnano-av', 'search', {
                "code": encodeURIComponent(code)
            });

            return crawlHuman(crawler, url);

        case "human-id":
            // get crawler
            var { crawler, url } = prepare('minnano-av', 'id', {
                "code": encodeURIComponent(code)
            });

            return crawlHuman(crawler, url);
        
        default:
            throw new Error('No crawler has found!');
    }
}

module.exports.crawl = crawl;
