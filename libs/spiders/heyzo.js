'use strict';

const clone = require('clone');
const util = require('../util.js');

const { MovieInfo, SearchResult } = require('../../models/types.js');
const crawlers = require('../crawlers');

const NAME = 'heyzo';
module.exports.name = function () {
    return NAME;
}

const TARGET = 'movie';
module.exports.target = function () {
    return TARGET;
}

function crawl (opt) {
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

module.exports.crawl = crawl;
