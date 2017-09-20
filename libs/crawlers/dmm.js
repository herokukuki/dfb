'use strict';

const { MovieInfo, SearchResult } = require('../../models/types.js');
const leech = require('../leech-promise.js');
const util = require('../util.js');
const parseURL = require('url').parse;

const NAME = 'dmm';
module.exports.name = function () {
    return NAME;
}

const TEMPLATE = {
    "search": "http://unblockdmm.com/browse.php?u=http://www.dmm.co.jp/search/=/searchstr={qtext}/sort=date",
    "id": "http://unblockdmm.com/browse.php?u=http://www.dmm.co.jp/mono/dvd/-/detail/=/cid={qtext}",
}

const DOMAIN = 'unblockdmm.com';
module.exports.domain = function () {
    return DOMAIN;
}

const BASE_URL = 'http://' + DOMAIN;

function formatDuration (val) {
    let minutes = parseInt(val);
    let hours = Math.floor(minutes / 60);
    minutes = minutes - hours * 60;

    if (hours < 10) { hours = '0' + hours; }
    if (minutes < 10) { minutes = '0' + minutes; }

    return hours + ':' + minutes + ':' + '00';
}

function crawl (opt) {
    let url = "";
    if (typeof opt == 'string') {
        url = opt;
    }

    if (typeof opt == 'object') {
        let type = opt.type || '';
        let qtext = opt.qtext || '';
        if (type && qtext) {
            url = TEMPLATE[type].replace('{qtext}', qtext);
        }
    }

    if (url == "") {
        throw new Error("Invalid Arguments");
    }

    let urlpath = BASE_URL + parseURL(url).pathname;

    return new Promise((resolve, reject) => {
        leech.get(url)
        .then($ => {
            if ($('p.red').length > 1 ||
                $('h1:contains("UNBLOCKDMM")').length > 0) {
                return resolve(null);
            }
            
            if ($('#list').length > 0) {
                // Search result
                let result = new SearchResult({
                    url: url,
                    queryString: $('input#searchstr').attr('value'),
                });

                $('#list > li > div').each((i, el) => {
                    let info = new MovieInfo({
                        country: 'Japan',
                        origlang: 'Japanese',
                    });
                    let ele = $(el);
                    let movid = ele.find('img').attr('src').split('/');
                    movid = movid[movid.length - 2];

                    info.url = BASE_URL + decodeURIComponent(
                        ele.find('a').attr('href')
                    );
                    info.posters.push({
                        url: ele.find('img').attr('src')
                    });
                    info.title = movid
                    info.origtitle = ele.find('img').attr('alt');

                    let tag = ele.find('div.value p.price');
                    if (tag.length > 0) {
                        info.tags.push({
                            url: info.url,
                            text: 'price: ' + tag.text().trim(),
                        })
                    }

                    result.results.push(info);
                })

                result.more = $('.d-item').length > 0;

                return resolve(result);
            }

            if ($('.hreview').length > 0) {
                // Movie content
                let info = new MovieInfo({
                    url: decodeURIComponent(url),
                    country: 'Japan',
                    origlang: 'Japanese',
                });

                info.posters.push({
                    url: decodeURIComponent($('div#sample-video a').first().attr('href')),
                });

                let movid = $('div#sample-video a').first().attr('id');

                $('div#sample-image-block img').each((i, el) => {
                    let ele = $(el);
                    info.screenshots.push({
                        url: decodeURIComponent(ele.attr('src')),
                    });
                });
                
                info.title = movid;
                info.origtitle = $('meta[property="og:title"]').attr('content');

                info.description = $('div.mg-b20.lh4').text().trim().split('\n')[0];

                let ele = $('table[cellpadding="2"] td:contains("シリーズ：")').next().find('a');
                if (ele.length > 0) {
                    info.series = {
                        url: BASE_URL + decodeURIComponent(ele.attr('href')),
                        text: ele.text(),
                    }
                }

                ele = $('table[cellpadding="2"] td:contains("メーカー：")').next().find('a');
                if (ele.length > 0) {
                    info.maker = ele.text()
                }

                ele = $('table[cellpadding="2"] td:contains("レーベル：")').next().find('a');
                if (ele.length > 0) {
                    info.label = {
                        url: BASE_URL + decodeURIComponent(ele.attr('href')),
                        text: ele.text(),
                    }
                }

                info.rating = parseFloat(
                    JSON.parse($('script[type="application/ld+json"]')[0].childNodes[0].data.trim())["aggregateRating"]["ratingValue"]
                ) * 2;

                ele = $('table[cellpadding="2"] td:contains("収録時間：")').next().text();
                if (ele != '----') {
                    info.duration = formatDuration(ele.substring(0, ele.length - 1));
                }

                ele = $('table[cellpadding="2"] td:contains("貸出開始日：")').next().text();
                if (ele) {
                    info.releasedate = util.replaceAll(ele, '/', '-');
                }

                ele = $('table[cellpadding="2"] td:contains("発売日：")').next().text();
                if (ele) {
                    info.releasedate = util.replaceAll(ele, '/', '-');
                }

                if (info.releasedate) {
                    info.year = info.releasedate.substring(0, 4);
                }

                ele = $('table[cellpadding="2"] td:contains("出演者：")').next().find('a');
                if (ele.length > 0) {
                    ele.each((i, el) => {
                        let ele2 = $(el);
                        info.actors.push({
                            url: BASE_URL + decodeURIComponent(ele2.attr('href')),
                            text: ele2.text(),
                        });
                    })
                }

                ele = $('table[cellpadding="2"] td:contains("監督：")').next().find('a');
                if (ele.length > 0) {
                    info.director = {
                        url: BASE_URL + decodeURIComponent(ele.attr('href')),
                        text: ele.text(),
                    }
                }

                ele = $('table[cellpadding="2"] td:contains("ジャンル：")').next().find('a');
                if (ele.length > 0) {
                    ele.each((i, el) => {
                        let ele2 = $(el);
                        info.genres.push({
                            url: BASE_URL + decodeURIComponent(ele2.attr('href')),
                            text: ele2.text(),
                        });
                    })
                }

                return resolve(info);
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
