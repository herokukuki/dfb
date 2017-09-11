'use strict';

const { HumanInfo } = require('../types.js');
const leech = require('../leech-promise.js');

const NAME = 'javmodel';
module.exports.name = function () {
    return NAME;
}

const DOMAIN = 'javmodel.com';
module.exports.domain = function () {
    return DOMAIN;
}

const BASE_URL = 'http://' + DOMAIN;

function crawl (url) {
    return new Promise(
        (resolve, reject) => {
            leech.request(url)
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

                        info.name = ele[1].trim();
                        info.transname = ele[0].trim();
                        // ====================================================

                        // get photos =========================================
                        ele = $('img[alt="' + info.transname + '"]').attr('src');
                        info.photos.push(ele);
                        // ====================================================

                        // get birthday, bio, tags ============================
                        ele = $('h2.title-medium.br-bottom:contains("' + 
                            info.transname + 
                        '")').next().find('li');

                        var val = $(ele[0]).text();
                        val = val.split(':')[1].trim().split('/');
                        info.birthday = val[2] + '-' + val[1] + '-' + val[0];

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
            });
        }
    )
}

module.exports.crawl = crawl;
