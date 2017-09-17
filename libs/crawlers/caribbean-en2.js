'use strict';

const { MovieInfo } = require('../../models/types.js');
const leech = require('../leech-promise.js');

const NAME = 'caribbean-en2';
module.exports.name = function () {
    return NAME;
}

const TEMPLATE = {
    "search": "",
    "id": "https://en.caribbeancom.com/eng/moviepages/{qtext}/index.html",
}

const DOMAIN = 'en.caribbeancom.com';
module.exports.domain = function () {
    return DOMAIN;
}

const BASE_URL = 'https://' + DOMAIN;

function formatTitle (val) {
    return val.replace(BASE_URL, '')
        .replace('/moviepages/', '')
        .replace('/index.html', '')
        .trim();
}

function formatDate (val) {
    let p = val.split('/');
    let year = p[0];
    let releasedate = p[0] + '-' + p[1] + '-' + p[2];
    return { year, releasedate };
}

function formatDuration (val) {
    let p = val.split(':');
    let hours = parseInt(p[0]);
    let minutes = parseInt(p[1]);
    let seconds = parseInt(p[2]);

    return (hours * 60) + minutes + (seconds / 60);
}

function formatPoster (val) {
    let url = val.replace('index.html', '');
    return url + 'images/poster_en.jpg';
}

function crawl (opt) {
    let url = "";
    if (typeof opt == 'string') {
        url = opt;
    }

    if (typeof opt == 'object') {
        let qtext = opt.qtext || '';
        if (qtext) {
            url = TEMPLATE["id"].replace('{qtext}', qtext);
        }
    }

    if (url == "") {
        throw new Error("Invalid Arguments");
    }

    return new Promise((resolve, reject) => {
        return leech.get(url)
        .then($ => {
            if ($('h1:contains("404 NOT FOUND")').length > 0) {
                resolve(null);
            } else {
                let info = new MovieInfo({ url: url, country: 'Japan', origlang: 'Japanese' });

                info.title = 'Caribbeancom ' + formatTitle(url);
                info.transtitle = $('div.video-detail > h1').text().trim();

                let { year, releasedate } = formatDate($('dd[itemprop="uploadDate"]').text());
                info.year = year;
                info.releasedate = releasedate;

                info.duration = formatDuration($('dd span[itemprop="duration"]').text());

                info.maker = 'Caribbeancom';

                $('dl.movie-info-cat dd').each((i, el) => {
                    let ele = $(el);
                    let genre = {
                        url: BASE_URL + ele.find('a').attr('href'),
                        text: ele.text(),
                    };

                    info.genres.push(genre);
                });

                if ($('dt:contains("Starring:")').length > 0) {
                    $('dt:contains("Starring:")').next().text()
                    .replace(/\s\s+/g, ' ').trim()
                    .split(',').forEach(name => {
                        let actor = {
                            url: '',
                            text: name,
                        }

                        info.actors.push(actor);
                    });
                }

                info.description = $('div.movie-comment > p').text().trim();

                info.posters.push(formatPoster(url));

                resolve(info);
            }
        })
        .catch(err => {
            var mss = err.message;
            if (mss.indexOf('HTTP Code') >= 0) {
                console.log('<' + mss + '> at ' + url)
                resolve(null);
            } else {
                reject(err);
            }
        });
    });
}

module.exports.crawl = crawl;
