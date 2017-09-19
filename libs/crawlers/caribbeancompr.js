'use strict';

const { MovieInfo } = require('../../models/types.js');
const leech = require('../leech-promise.js');

const NAME = 'caribbeancompr';
module.exports.name = function () {
    return NAME;
}

const TEMPLATE = {
    "search": "",
    "id": "http://www.caribbeancompr.com/moviepages/{qtext}/index.html",
}

const DOMAIN = 'www.caribbeancompr.com';
module.exports.domain = function () {
    return DOMAIN;
}

const BASE_URL = 'http://' + DOMAIN;

function formatTitle (val) {
    return val.replace(BASE_URL, '')
        .replace('/moviepages/', '')
        .replace('/index.html', '')
        .trim();
}

function formatPoster (val) {
    let url = val.replace('index.html', '');
    return url + 'images/l_l.jpg';
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
            if ($('title').text() == 'カリビアンコムプレミアム 単品購入') {
                resolve(null);
            } else {
                let info = new MovieInfo({ url: url, country: 'Japan', origlang: 'Japanese' });

                info.title = 'Caribbeancompr ' + formatTitle(url);
                info.origtitle = $('div.video-detail > h1').text().trim();

                info.releasedate = $('div.movie-info dt:contains("販売日:")').next().text();
                info.year = info.releasedate.substring(0, 4);

                info.duration = $('div.movie-info dt:contains("再生時間:")').next().text();

                info.maker = 'カリビアンコムプレミアム';

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

                if ($('dt:contains("スタジオ:")').length > 0) {
                    let ele = $('dt:contains("スタジオ:")').next().find('a')
                    info.provider = {
                        url: BASE_URL + ele.attr('href'),
                        text: ele.text(),
                    }
                }

                info.posters.push({
                    url: formatPoster(url)
                });

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
