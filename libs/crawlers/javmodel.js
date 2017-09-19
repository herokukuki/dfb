'use strict';

const { HumanName, HumanInfo } = require('../../models/types.js');
const leech = require('../leech-promise.js');

const NAME = 'javmodel';
module.exports.name = function () {
    return NAME;
}

const TEMPLATE = {
    "search": "",
    "id": "http://javmodel.com/jav/{qtext}/",
}

const DOMAIN = 'javmodel.com';
module.exports.domain = function () {
    return DOMAIN;
}

const BASE_URL = 'http://' + DOMAIN;

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
            try {
                if ($('div.text-404:contains("404")').length > 0) {
                    
                    // Not found on server
                    resolve(null);
                } else {

                    // Have record
                    var info = new HumanInfo({
                        url: url
                    });

                    // get name, transname ================================
                    var ele = $('meta[name=Keywords]').attr('content');
                    ele = ele.split(',');

                    info.name = new HumanName({
                        value: ele[1].trim(),
                        type: 'ja',
                        engname: ele[0].trim(),
                    });
                    // ====================================================

                    // get photos =========================================
                    ele = $('img[alt="' + info.name.en + '"]').attr('src');
                    info.photos.push({
                        url: ele
                    });
                    // ====================================================

                    // get birthday, bio, tags ============================
                    ele = $('h2.title-medium.br-bottom:contains("' + 
                        info.name.en + 
                    '")').next().find('li');

                    var val = $(ele[0]).text();
                    val = val.split(':')[1].trim().split('/');
                    info.birthday = val[2] + '-' + val[0] + '-' + val[1];

                    val = $(ele[1]).text().split(':')[1].trim();
                    info.bio.blood = val;

                    val = $(ele[2]).text().split(':')[1].trim();
                    info.bio.bust = val.split(' ')[0];

                    val = $(ele[3]).text().split(':')[1].trim();
                    info.bio.waist = val.split(' ')[0];

                    val = $(ele[4]).text().split(':')[1].trim();
                    info.bio.hip = val.split(' ')[0];

                    val = $(ele[5]).text().split(':')[1].trim();
                    info.bio.tall = val.split(' ')[0];

                    $(ele[6]).find('a').each((idx, el) => {
                        var e = $(el);
                        var tag = {
                            text: e.text(),
                            url: BASE_URL + e.attr('href')
                        };
                        
                        info.tags.push(tag);
                    });
                    // ====================================================

                    info.rating = null;

                    return resolve(info);
                }
            } catch (err) {
                return reject(err);
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
        })
    });
}

module.exports.crawl = crawl;
