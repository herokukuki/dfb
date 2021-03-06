'use strict';

const crawlers = require('./crawlers');
const spiders = require('./spiders');

function findCrawlers (selector) {
    let result = [];
    for (var name in crawlers) {
        let crawler = crawlers[name];
        if (selector(crawler)) {
            result.push(crawler);
        }
    }
    return result;
}

function firstCrawler (selector) {
    let result = findCrawlers(selector);
    if (result.length > 0) {
        return result[0];
    } else {
        return null;
    }
}

function findSpiders (selector) {
    let result = [];
    for (var name in spiders) {
        let spider = spiders[name];
        if (selector(spider)) {
            result.push(spider);
        }
    }
    return result;
}

function firstSpider (selector) {
    let result = findSpiders(selector);
    if (result.length > 0) {
        return result[0];
    } else {
        return null;
    }
}

function summon (options) {
    let target = options.target || '';

    if (options.assign) {
        let assign = options.assign;
        
        let spider = firstSpider(v => v.name() == assign && 
                                      v.target() == target);
        if (spider) {
            return [spider, null];
        }

        let crawler = firstCrawler(v => v.name() == assign);
        if (crawler) {
            return [crawler, null];
        }
    }

    let qtext = options.qtext || '';

    if (target == "human") {
        return [ 
            firstSpider(v => v.name() == "minnano-av"), 
            null 
        ];
    }

    if (target == "movie") {
        if (qtext.indexOf(' ') > 0) {
            let pos = qtext.indexOf(' ');
            let name = qtext.substring(0, pos).trim();
            let id = qtext.substring(pos).trim();
            
            let spider = firstSpider(
                v => 
                    v.name().indexOf(name) > -1 && 
                    v.target() == target);

            if (spider) {
                return [ spider, id ];
            } else {
                return [ 
                    firstCrawler(v => v.name() == name), 
                    id 
                ];
            }
        } else {
            return [ 
                firstSpider(v => v.name() == "dmm"), 
                null 
            ];
        }
    }
}

function crawl (queryText, options) {
    let qtext = (queryText || '').toLowerCase();
    let opt = options || {};
    
    if (qtext == '') {
        return null;
    }

    let target = opt.target || '';
    let type = opt.type || '';

    if (!target || !type) {
        throw new Error("Invalid Arguments");
    }

    let [ spider, id ] = summon({
        target: target, 
        qtext: qtext,
        assign: options.assign,
    });

    if (!spider) {
        return Promise.reject('Crawler not found');
    }

    return spider.crawl({
        "type": type,
        "qtext": id || qtext,
    });
}

module.exports.crawl = crawl;
