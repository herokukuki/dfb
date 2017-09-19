'use strict';

const { MovieInfo } = require('../../models/types.js');
const leech = require('../leech-promise.js');

const NAME = '10musume';
module.exports.name = function () {
    return NAME;
}

const TEMPLATE = {
    "search": "",
    "id": "http://www.10musume.com/moviepages/{qtext}/index.html",
}

const DOMAIN = 'www.10musume.com';
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
    return url + 'images/str.jpg';
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
        return leech.get({
            url: url,
            charset: 'euc-jp'
        })
        .then($ => {
            if ($('title').text() == '素人アダルト動画　天然むすめ 撮り卸しオリジナル素人動画1  ') {
                resolve(null);
            } else {
                let info = new MovieInfo({ url: url, country: 'Japan', origlang: 'Japanese' });

                info.title = '10musume ' + formatTitle(url);
                info.origtitle = $('div.detail-info__meta dt:contains("タイトル:")').next().text();

                info.releasedate = $('div.detail-info__meta dt:contains("配信日:")').next().text();
                info.year = info.releasedate.substring(0, 4);

                info.duration =
                    $('div.detail-info__meta dt:contains("再生時間:")').next().text();

                info.maker = '天然むすめ';

                $('div.detail-info__meta dt:contains("カテゴリー:")').next().find('a')
                .each((i, el) => {
                    let ele = $(el);
                    let genre = {
                        url: ele.attr('href'),
                        text: ele.text(),
                    };

                    info.genres.push(genre);
                });

                let ele = $('div.detail-info__meta dt:contains("出演:")').next().find('a')
                ele.text().split(' ').forEach(el => {
                    let actor = {
                        url: ele.attr('href'),
                        text: el
                    };

                    info.actors.push(actor);
                });

                info.description = $('div.detail-info__item > p.detail-info__comment').text().trim();

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
