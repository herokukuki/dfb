'use strict';

const { MovieInfo } = require('../../models/types.js');
const leech = require('../leech-promise.js');

const NAME = 'caribbean';
module.exports.name = function () {
    return NAME;
}

const DOMAIN = 'www.caribbeancom.com';
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
    return url + 'images/l_l.jpg';
}

function crawl (url) {
    return new Promise((resolve, reject) => {
        return leech.get(url)
        .then($ => {
            if ($('h1:contains("404 NOT FOUND")').length > 0) {
                resolve(null);
            } else {
                let info = new MovieInfo({ url: url, country: 'Japan', origlang: 'Japanese' });

                info.title = 'Caribbeancom ' + formatTitle(url);
                info.origtitle = $('div.video-detail > h1').text().trim();

                let { year, releasedate } = formatDate($('dd[itemprop="uploadDate"]').text());
                info.year = year;
                info.releasedate = releasedate;

                info.duration = formatDuration($('dd span[itemprop="duration"]').text());

                info.maker = 'カリビアンコム';

                $('dl.movie-info-cat dd').each((i, el) => {
                    let ele = $(el);
                    let genre = {
                        url: BASE_URL + ele.find('a').attr('href'),
                        text: ele.text(),
                    };

                    info.genres.push(genre);
                });

                if ($('dt:contains("出演:")').length > 0) {
                    $('dt:contains("出演:")').next().find('a').each((i, el) => {
                        let ele = $(el);
                        let actor = {
                            url: BASE_URL + ele.attr('href'),
                            text: ele.text(),
                        }

                        info.actors.push(actor);
                    });
                }

                info.description = $('div.movie-comment > p').text().trim();

                if ($('dt:contains("シリーズ:")').length > 0) {
                    let ele = $('dt:contains("シリーズ:")').next().find('a');
                    info.series = {
                        url: BASE_URL + ele.attr('href'),
                        text: ele.text(),
                    }
                }

                if ($('dt:contains("ユーザー評価:")').length > 0) {
                    let ele = $('dt:contains("ユーザー評価:")').next()
                    info.rating = ele.text().trim().length * 2;
                }

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
