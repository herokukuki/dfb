'use strict';

const path = require('path');
const clone = require('clone');

const { HumanInfo, SearchResult } = require('../models/types.js');

const CRAWLERS = { };

function registerCrawler (modulePath) {
    let mdl = require(modulePath);
    let mdlName = mdl.name();
    CRAWLERS[mdlName] = mdl;
}

registerCrawler('./crawlers/minnano-av.js');
registerCrawler('./crawlers/javmodel.js');
registerCrawler('./crawlers/caribbean.js');
registerCrawler('./crawlers/caribbean-en1.js');
registerCrawler('./crawlers/caribbean-en2.js');
registerCrawler('./crawlers/1pondo.js');

const SEARCH_TEMPLATE = {
    "minnano-av": {
        url: "http://www.minnano-av.com/search_result.php?search_scope=actress&search_word={code}",
        form: false
    },

    "wap": {
        url: "http://warashi-asian-pornstars.fr/en/s-12/search",
        form: true
    },
}

const ID_TEMPLATE_URL = {
    "minnano-av": "http://www.minnano-av.com/{code}",

    "javmodel": "http://javmodel.com/jav/{code}/",

    "caribbean": "https://www.caribbeancom.com/moviepages/{code}/index.html",

    "caribbean-en1": "https://www.caribbeancom.com/eng/moviepages/{code}/index.html",

    "caribbean-en2": "https://en.caribbeancom.com/eng/moviepages/{code}/index.html",

    "1pondo": "http://www.1pondo.tv/dyn/ren/movie_details/movie_id/{code}.json",
}

function prepare(crawlerName, type, params) {
    let crawler = CRAWLERS[crawlerName];
    let url = "";

    switch(type) {
        case "search":
            let tpl = SEARCH_TEMPLATE[crawlerName]
            url = tpl.url;

            if (tpl.form) {
                let formdata = [];
                if (params["code"])
                    formdata.push(params["code"]);

                return { crawler, url, formdata };
            } else {
                if (params["code"])
                    url = url.replace('{code}', encodeURIComponent(params["code"]));

                return { crawler, url };
            }
            break;

        case "id":
            url = ID_TEMPLATE_URL[crawlerName]
            if (params["code"])
                url = url.replace('{code}', encodeURIComponent(params["code"]));

            return { crawler, url };
    }
}

// HUMAN CRAWLER ==============================================================
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
        } else if (d instanceof SearchResult) {
            // End of the road, I want to get some images of the people but I can't.
            return d;
        } else {
            return d;
        }
    });
}
// ============================================================================

// MOVIE CRAWLER ==============================================================
function crawlCaribbean (code) {
    let { "crawler": crawler1, "url": url1 } = prepare('caribbean', 'id', {
        "code": code
    });
    

    let { "crawler": crawler2, "url": url2 } = prepare('caribbean-en1', 'id', {
        "code": code
    });

    let { "crawler": crawler3, "url": url3 } = prepare('caribbean-en2', 'id', {
        "code": code
    });

    return Promise.all([
        crawler1.crawl(url1),
        crawler2.crawl(url2),
        crawler3.crawl(url3),
    ])
    .then(data => {
        let d1 = data[0];
        let d2 = data[1];
        let d3 = data[2];

        if (d1 == null) {
            return null;
        } else {
            let d = clone(d1);
            if (d2.transtitle) d.transtitle = d2.transtitle;
            if (d2.genres.length > 0) d.genres = d2.genres;
            if (d3.description) d.description = d3.description;

            return d;
        }
    })
}

function crawlMovie (crawler, type, code) {
    code = code.toLowerCase();
    let name = crawler.name();
    if (name === 'caribbean') {
        let movieid = code.split(' ')[1].trim();
        return crawlCaribbean(movieid);
    } else if (name === '1pondo') {
        let movieid = code.split(' ')[1].trim();
        let { _, url } = prepare(name, 'id', {
            "code": movieid
        });
        return crawler.crawl(url);
    } else {
        let { _, url } = prepare(name, type, {
            "code": code
        });
        return crawler.crawl(url);
    }
}

function findMovieCrawler (code) {
    code = code.toLowerCase();
    if (code.indexOf(' ') > 0) {
        // format source mov-id
        let pos = code.indexOf(' ');
        let maker = code.substring(0, pos).trim();
        let id = code.substring(pos).trim();

        if (maker.indexOf('caribbean') >= 0) {
            return CRAWLERS["caribbean"];
        } else if (maker.indexOf('1pondo') >= 0) {
            return CRAWLERS["1pondo"];
        } else {
            return null;
        }
    } else {
        // format mov-id
        return null;
    }
}
// ============================================================================

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

        case "movie":
            var crawler = findMovieCrawler(code);
            return crawlMovie(crawler, 'search', code);
        
        default:
            throw new Error('No crawler has found!');
    }
}

module.exports.crawl = crawl;
