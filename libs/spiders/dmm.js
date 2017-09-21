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

function mixMovieInfo (des, src) {
    if (src.title) des.title = src.title;
    if (src.transtitle) des.transtitle = src.transtitle;
    if (src.genres.length > 0) des.genres = src.genres;
    return des;
}

function thenIfSearch (d1, opt) {
    let movid = util.replaceAll(opt.qtext, '-', '').toLowerCase();
    let df = d1.results.filter(
        v => v.title.indexOf(movid) > -1 &&
             v.url.indexOf('www.dmm.co.jp/mono/dvd/') > -1);

    if (df.length == 0) {
        let d = clone(d1);
        d.results.reverse();
        return d;

    } else if (df.length > 1) {
        let d = clone(d1);
        d.results = df;
        d.results.reverse();
        return d;

    } else { // df.length == 1
        let u = df[0];
        let dmm = crawlers['dmm'];
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
                mixMovieInfo(d, d22);
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
                        mixMovieInfo(d, d3);
                        return d;
                    })

                }
            }

            return d21;
        })
    }
}

function thenIfId (d1, opt) {
    let javlib = crawlers['javlibrary'];
    return javlib.crawl({
        qtext: opt.qtext,
        type: 'search',
        lang: 'en',
    })
    .then(d2 => {
        if (d2 instanceof MovieInfo) {
            let d = clone(d1);
            mixMovieInfo(d, d2);
            return d;
        }

        if (d2 instanceof SearchResult) {
            let d2_title = util.replaceAll(d2.results[0].title, '-', '')
                .toLowerCase()
                .trim();

            let qtext_title = opt.qtext.toLowerCase().trim();
            
            if (d2_title == qtext_title) {
                let d2_url = d2.results[0].url;
                return javlib.crawl(d2_url)
                .then(d3 => {
                    let d = clone(d1);
                    mixMovieInfo(d, d3);
                    return d;
                })
            }
        }

        return d1;
    })
}

function crawl (options) {
    let dmm = crawlers['dmm'];

    if (typeof options == 'string') {
        return dmm.crawl(options);
    }

    let qtext = (options.qtext || '').toLowerCase();
    let type = (options.type || '');

    if (!qtext || !type) {
        throw new Error('Invalid Argument');
    }

    let opt = {
        qtext: qtext,
        type: type
    }

    return dmm.crawl(opt)
    .then(d => {
        if (d instanceof SearchResult) {
            return thenIfSearch(d, opt);
        }

        if (d instanceof MovieInfo) {
            return thenIfId(d, opt);
        }

        return null;
    })
}

module.exports.crawl = crawl;
