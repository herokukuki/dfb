'use strict';

const { MovieInfo } = require('../../models/types.js');
const leech = require('../leech-promise.js');

const NAME = 'caribbeancom-en1';
module.exports.name = function () {
    return NAME;
}

const TEMPLATE = {
    "search": "",
    "id": "https://www.caribbeancom.com/eng/moviepages/{qtext}/index.html",
}

const DOMAIN = 'www.caribbeancom.com';
module.exports.domain = function () {
    return DOMAIN;
}

const BASE_URL = 'https://' + DOMAIN;

function formatTitle (val) {
    return val.replace(BASE_URL + '/eng', '')
        .replace('/moviepages/', '')
        .replace('/index.html', '')
        .trim();
}

function formatDate (val) {
    let p = val.split(' ')[0].split('/');
    let year = p[0];
    let releasedate = p[0] + '-' + p[1] + '-' + p[2];
    return { year, releasedate };
}

function formatRating (val) {
    let s = val.substring('/images/star/star_'.length).replace('.gif', '');
    return parseInt(s) / 10;
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
            if ($('title').text() == 'Caribbeancom.com') {
                resolve(null);
            } else {
                let info = new MovieInfo({ url: url, country: 'Japan', origlang: 'Japanese' });

                let rawtitle = $('div.h2_long_wrapper_dokusen > h2').text().split('::');
                
                info.title = 'Caribbeancom ' + formatTitle(url);
                info.transtitle = rawtitle[0].trim();

                rawtitle[1].trim().split(',').forEach(el => {
                    let actor = {
                        url: '',
                        text: el.trim(),
                    };

                    info.actors.push(actor);
                });

                let { year, releasedate } = formatDate($('td:contains("Update:")').next().text());
                info.year = year;
                info.releasedate = releasedate;

                info.duration = $('td:contains("Length:")').next().text();

                info.maker = 'Caribbeancom';

                let rawgenres = 
                    $('head meta[name="keywords"]').attr("content").trim().split(',');

                for (var i = info.actors.length; i < rawgenres.length; i++) {
                    let genre = {
                        url: '',
                        text: rawgenres[i].trim(),
                    };

                    info.genres.push(genre);
                }

                info.rating = formatRating(
                    $('td:contains("Overall:")').next().find('img').attr('src')
                );

                info.posters.push(
                    BASE_URL + $('img[src^="/moviepages"]').attr('src')
                );

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
