'use strict';

const clone = require('clone');
const { HumanInfo, SearchResult } = require('../models/types.js');
const crawlers = require('./crawlers');
const spiders = [
    {
        "name": "minnano-av",
        "target": "human",
        "crawl": function (opt) {
            let crawler = crawlers["minnano-av"];
            return crawler.crawl(opt)
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
                            let crawler = crawlers["javmodel"];
                            return crawler.crawl({
                                type: 'id',
                                qtext: infoid
                            });
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
                } else if (d instanceof SearchResult) {
                    // End of the road, I want to get some images of the people but I can't.
                    return d;
                } else {
                    return d;
                }
            });
        }
    },

    {
        "name": "caribbeancom",
        "target": "movie",
        "crawl": function (opt) {
            let crawler1 = crawlers["caribbeancom"];
            let crawler2 = crawlers["caribbeancom-en1"];
            let crawler3 = crawlers["caribbeancom-en2"];
        
            return Promise.all([
                crawler1.crawl(opt),
                crawler2.crawl(opt),
                crawler3.crawl(opt),
            ])
            .then(data => {
                let d1 = data[0];
                let d2 = data[1];
                let d3 = data[2];
        
                if (d1 == null) {
                    return null;
                } else {
                    let d = clone(d1);
                    if (d3) {
                        if (d3.description) d.description = d3.description;
                        if (d3.genres.length > 0) d.genres = d3.genres;
                    }
                    if (d2) {
                        if (d2.transtitle) d.transtitle = d2.transtitle;
                        if (d2.genres.length > 0) d.genres = d2.genres;
                    }
        
                    return d;
                }
            });
        }
    },

    {
        "name": "heyzo",
        "type": "movie",
        "crawl": function (opt) {
            let crawler1 = crawlers['heyzo'];
            let crawler2 = crawlers['heyzo-en'];

            return Promise.all([
                crawler1.crawl(opt),
                crawler2.crawl(opt),
            ])
            .then(data => {
                let d1 = data[0];
                let d2 = data[1];
        
                if (d1 == null) {
                    return null;
                } else {
                    let d = clone(d1);
                    if (d2) {
                        if (d2.transtitle) d.transtitle = d2.transtitle;
                        if (d2.series) d.series = d2.series;
                        if (d2.genres.length > 0) d.genres = d2.genres;
                        if (d2.posters.length > 0) d.posters = d2.posters;
                    }
        
                    return d;
                }
            });
        }
    }
]

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
    for (var spider of spiders) {
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

function summon (target, qtext) {

    if (target == "human") {
        return [ 
            firstSpider(v => v.name == "minnano-av"), 
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
                    v.name.indexOf(name) > -1 && 
                    v.target == target);

            if (spider) {
                return [ spider, id ];
            } else {
                return [ 
                    firstCrawler(v => v.name() == name), 
                    id 
                ];
            }
        } else {
            throw new Error('Not Implemented');
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

    let [ spider, id ] = summon(target, qtext);

    return spider.crawl({
        "type": type,
        "qtext": id || qtext,
    });
}

module.exports.crawl = crawl;
