'use strict';

const { MovieInfo } = require('../../models/types.js');
const leech = require('../leech-promise.js');
const util = require('../util.js');

const NAME = 'heyzo';
module.exports.name = function () {
    return NAME;
}

const TEMPLATE = {
    "search": "",
    "id": "http://www.heyzo.com/moviepages/{qtext}/index.html",
}

const DOMAIN = 'www.heyzo.com';
module.exports.domain = function () {
    return DOMAIN;
}

const BASE_URL = 'http://' + DOMAIN;

function getMovieID (val) {
    return val.replace('http://www.heyzo.com/moviepages/', '')
              .replace('/index.html', '');
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
        leech.get(url)
        .then($ => {
            if ($('h1:contains("404")').length > 0) {
                resolve(null);
            } else {

                let info = new MovieInfo({ 
                    url: url, 
                    country: 'Japan', 
                    origlang: 'Japanese' 
                });

                let movid = getMovieID(url);

                info.title = 'HEYZO ' + movid;
                info.origtitle = util.formatText($('div#movie h1').text()).split(' - ')[0];

                info.posters.push(
                    'http://www.heyzo.com/contents/3000/' + movid + '/images/player_thumbnail.jpg'
                )

                info.releasedate = util.formatText($('div#movie span.release-day').next().text());
                info.year = info.releasedate.substring(0, 4);

                $('div#movie span.actor').next().find('a').each((i, el) => {
                    let ele = $(el);
                    let actor = {
                        url: BASE_URL + ele.attr('href'),
                        text: ele.text(),
                    }

                    info.actors.push(actor);
                });

                let ele = $('div#movie span.label').next().find('a');

                info.series = {
                    url: BASE_URL + ele.attr('href'),
                    text: ele.text(),
                }

                info.rating = parseFloat(
                    $('div#movie span.estimate').next().find('span[itemprop=ratingValue]').text()
                ) * 2;

                $('div#movie div.actor-type a').each((i, el) => {
                    let ele = $(el);
                    let genre = {
                        url: BASE_URL + ele.attr('href'),
                        text: ele.text(),
                    }

                    info.genres.push(genre);
                });

                $('div#movie div.tag_cloud a').each((i, el) => {
                    let ele = $(el);
                    let genre = {
                        url: BASE_URL + ele.attr('href'),
                        text: ele.text(),
                    }

                    info.genres.push(genre);
                });

                info.description = $('div#movie p.memo').text();

                info.maker = 'HEYZO';

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
    })
}

module.exports.crawl = crawl;
