'use strict';

const clone = require('clone');
const util = require('../util.js');

const { MovieInfo, SearchResult } = require('../../models/types.js');
const crawlers = require('../crawlers');

const NAME = 'caribbeancom';
module.exports.name = function () {
    return NAME;
}

const TARGET = 'movie';
module.exports.target = function () {
    return TARGET;
}

function crawl (opt) {
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

module.exports.crawl = crawl;
