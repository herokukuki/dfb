'use strict';

const { MovieInfo } = require('../../models/types.js');
const leech = require('../leech-promise.js');

const NAME = '1pondo';
module.exports.name = function () {
    return NAME;
}

const TEMPLATE = {
    "search": "",
    "id": "http://www.1pondo.tv/dyn/ren/movie_details/movie_id/{qtext}.json",
}

const DOMAIN = 'www.1pondo.tv';
module.exports.domain = function () {
    return DOMAIN;
}

const BASE_URL = 'https://' + DOMAIN;

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
            if ($('h1:contains("404 Not Found")').length > 0) {
                resolve(null);
            } else {
                let info = new MovieInfo({ url: url, country: 'Japan', origlang: 'Japanese' });
                let data = JSON.parse($('body').text());

                info.title = '1Pondo ' + data["MovieID"];
                info.origtitle = data["Title"];

                info.url = 'https://www.1pondo.tv/movies/' + data["MovieID"] + '/';

                info.releasedate = data["Release"];
                info.year = data["Year"];

                info.posters.push(data["ThumbHigh"]);

                info.duration = data["Duration"] / 60;

                info.description = data["Desc"];

                data["Actor"].split(',').forEach((text, i) => {
                    let actor = {
                        url: 'https://www.1pondo.tv/search/?a=' + data["ActorID"][i],
                        text: text
                    };

                    info.actors.push(actor);
                });

                data["UCNAME"].forEach((text, i) => {
                    let genre = {
                        url: 'https://www.1pondo.tv/search/?c=' + data["UC"][i],
                        text: text
                    };

                    info.genres.push(genre);
                });

                info.maker = '一本道';

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
