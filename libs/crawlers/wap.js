'use strict';

const { HumanName, HumanInfo, SearchResult } = require('../../models/types.js');
const leech = require('../leech-promise.js');

const NAME = 'wap';
module.exports.name = function () {
    return NAME;
}

const TEMPLATE = {
    "search": "http://warashi-asian-pornstars.fr/en/s-12/search",
    "id": "",
}

const DOMAIN = 'warashi-asian-pornstars.fr';
module.exports.domain = function () {
    return DOMAIN;
}

const BASE_URL = 'http://' + DOMAIN;

function formatName (value) {
    if (value.indexOf('-') > 0) {
        let p = value.split('-');
        return new HumanName({
            type: 'ja',
            value: p[1].trim(),
            engname: p[0].trim(),
        });
    } else {
        value = value.trim();
        return new HumanName({
            type: 'ja',
            value: value,
            engname: value,
        });
    }
}

function crawl (opt) {
    let url = TEMPLATE["search"];
    let formdata = "";
    if (typeof opt == 'string') {
        formdata = opt;
    }

    if (typeof opt == 'object') {
        let qtext = opt.qtext || '';
        if (qtext) {
            formdata = qtext;
        }
    }

    if (formdata == "") {
        throw new Error("Invalid Arguments");
    }

    if (formdata) {
        // POST
        return new Promise((resolve, reject) => {
            return leech.post(url, {
                form: {
                    "recherche_critere": "f",
                    "recherche_valeur": formdata[0]
                }
            })
            .then($ => {

                var result = new SearchResult({ url: url });

                result.queryString = $('div#bloc-nb-resultats').text()
                    .split('results for your search')[1]
                    .trim();

                result.more = false;

                let peopleEl = $('div.resultat-pornostar');
                if (peopleEl.length > 0) {
                    peopleEl.each((i, ele) => {
                        let photo = BASE_URL + $(ele).find('img').attr('src');
                        let url = BASE_URL + $(ele).find('a').first().attr('href');
                        let rawname = $(ele).find('p').first().find('a').text().trim();
                        let altname = ($(ele).find('p:contains("AKA:")').text() || '').trim();

                        let info = new HumanInfo({ url: url });

                        info.photos.push(photo);

                        info.name = formatName(rawname);

                        altname = altname.substring('AKA:'.length);
                        if (altname.indexOf(',') > 0) {
                            altname.split(',').forEach(name => {
                                info.aliases.push(
                                    formatName(name.trim())
                                );
                            });
                        } else {
                            info.aliases.push(
                                formatName(altname.trim())
                            );
                        }

                        result.results.push(info);
                    });
                }

                resolve(result);
            })
            .catch(err => {
                var mss = err.message;
                if (mss.indexOf('HTTP Code') > 0) {
                    console.log('<' + mss + '> at ' + url)
                    resolve(null);
                } else {
                    reject(err);
                }
            });
        });
    } else {
        // GET
        return new Promise((resolve, reject) => {
            return leech.get(url)
            .then($ => {
                reject(new Error('Not implemented'));
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
}

module.exports.crawl = crawl;
