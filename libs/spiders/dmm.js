'use strict';

const clone = require('clone');
const util = require('../util.js');
const crawlers = require('../crawlers');

const { MovieInfo, SearchResult } = require('../../models/types.js');

const NAME = 'dmm';
module.exports.name = function () {
    return NAME;
}

const TARGET = 'movie';
module.exports.target = function () {
    return TARGET;
}

function crawl (opt) {
    if (typeof opt !== 'object') {
        throw new Error('Invalid Argument');
    }

    let movid = util.replaceAll(opt.qtext, '-', '').toLowerCase();
    let dmm = crawlers['dmm'];

    switch (opt.type) {
        case "search":
            return dmm.crawl({ qtext: opt.qtext, type: 'search' })
            .then(d1 => {
                if (d1) {
                    if (d1 instanceof SearchResult) {
                        let df = d1.results.filter(
                            v => v.title.indexOf(movid) > -1 &&
                                 v.url.indexOf('www.dmm.co.jp/mono/dvd/') > -1);

                        if (df.length == 0) {
                            return d1;

                        } else if (df.length > 1) {
                            let d = clone(d1);
                            d.results = df;
                            return d;

                        } else { // df.length == 1
                            let u = df[0];
                            let javlib = crawlers['javlibrary'];
                            return Promise.all([

                                dmm.crawl(u.url),

                                javlib.crawl({
                                    qtext: opt.qtext,
                                    type: 'search',
                                    lang: 'en',
                                }),
                            ])
                            .then(d2 => {
                                let d21 = d2[0];
                                let d22 = d2[1];

                                if (d22 instanceof MovieInfo) {
                                    let d = clone(d21);
                                    if (d22.title) d.title = d22.title;
                                    if (d22.transtitle) d.transtitle = d22.transtitle;
                                    if (d22.genres.length > 0) d.genres = d22.genres;
                                    return d;
                                }

                                if (d22 instanceof SearchResult) {
                                    let d22_title = d22.results[0].title.toLowerCase().trim();
                                    let qtext_title = opt.qtext.toLowerCase().trim();

                                    if (d22_title == qtext_title) {
                                        let d22_url = d22.results[0].url;
                                        return javlib.crawl(d22_url)
                                        .then(d3 => {
                                            let d = clone(d21);
                                            if (d3.title) d.title = d3.title;
                                            if (d3.transtitle) d.transtitle = d3.transtitle;
                                            if (d3.genres.length > 0) d.genres = d3.genres;
                                            return d;
                                        })

                                    } else {
                                        return d21;
                                    }
                                    
                                }

                                return d21;
                            })
                        }
                    }

                    throw new Error('Not implemented');
                } else {
                    return null;
                }
            });
        case "id":
            return dmm.crawl({ qtext: movid, type: 'id'})
            .then(d1 => {
                if (d1) {
                    if (d1 instanceof MovieInfo) {
                        let javlib = crawlers['javlibrary'];
                        return javlib.crawl({
                            qtext: movid,
                            type: 'search',
                            lang: 'en',
                        })
                        .then(d2 => {
                            if (d2 instanceof MovieInfo) {
                                let d = clone(d1);
                                d.genres = d2.genres;
                                return d;
                            }

                            return d1;
                        })
                    }

                    throw new Error('Not implemented');
                } else {
                    return null;
                }
            });
    };
}

module.exports.crawl = crawl;
