'use strict';

const { HumanName, HumanInfo, SearchResult } = require('../types.js');
const leech = require('../leech-promise.js');

const NAME = 'minnano-av';
module.exports.name = function () {
    return NAME;
}

const DOMAIN = 'www.minnano-av.com';
module.exports.domain = function () {
    return DOMAIN;
}

const BASE_URL = 'http://' + DOMAIN;

const JAPAN_PROVINE_JA_EN = {
    "愛知県": "Aichi",
    "秋田県": "Akita",
    "青森県": "Aomori",
    "千葉県": "Chiba",
    "愛媛県": "Ehime",
    "福井県": "Fukui",
    "福岡県": "Fukuoka",
    "福島県": "Fukushima",
    "岐阜県": "Gifu",
    "群馬県": "Gunma",
    "広島県": "Hiroshima",
    "北海道": "Hokkaido",
    "兵庫県": "Hyōgo",
    "茨城県": "Ibaraki",
    "石川県": "Ishikawa",
    "岩手県": "Iwate",
    "香川県": "Kagawa",
    "鹿児島県": "Kagoshima",
    "神奈川県": "Kanagawa",
    "高知県": "Kōchi",
    "熊本県": "Kumamoto",
    "京都府": "Kyoto",
    "三重県": "Mie",
    "宮城県": "Miyagi",
    "宮崎県": "Miyazaki",
    "長野県": "Nagano",
    "長崎県": "Nagasaki",
    "奈良県": "Nara",
    "新潟県": "Niigata",
    "大分県": "Ōita",
    "岡山県": "Okayama",
    "沖縄県": "Okinawa",
    "大阪府": "Osaka",
    "佐賀県": "Saga",
    "埼玉県": "Saitama",
    "滋賀県": "Shiga",
    "島根県": "Shimane",
    "静岡県": "Shizuoka",
    "栃木県": "Tochigi",
    "徳島県": "Tokushima",
    "東京都": "Tokyo",
    "鳥取県": "Tottori",
    "富山県": "Toyama",
    "和歌山県": "Wakayama",
    "山形県": "Yamagata",
    "山口県": "Yamaguchi",
    "山梨県": "Yamanashi",
};

function isList($) {
    return $('table.tbllist.actress').length > 0;
}

function formatName(name, transname) {
    if (!name) {
        throw new Error('Argument invalid');
    }

    if (transname) {
        // Case: transname has format: hiragana / engname
        var p = transname.split('/');
        var hiragana = p[0].trim();
        var engname = p[1].trim();
        
        return new HumanName({
            value: name,
            type: 'ja',
            hiragana: hiragana,
            engname: engname
        });
    }
    else {
        // Case name has format: value （hiragana / engname）
        if (name.indexOf(' （') > 0) {
            var p1 = name.split(' （');
            var name = p1[0].trim();
            console.log(p1[1]);

            var p2 = p1[1].split('/');
            var hiragana = p2[0].trim();
            var engname = p2[1].trim();
            engname = engname.substring(0, engname.length - 1);

            return new HumanName({
                value: name,
                type: 'ja',
                hiragana: hiragana,
                engname: engname
            });
        } else {

            return new HumanName({
                value: name,
                type: 'ja'
            });
        }
    }
}

function formatInt(str) {
    if (!str) {
        return '';
    } else return parseInt(str);
}

function formatFloat(str) {
    if (!str) {
        return '';
    } else return parseFloat(str);
}

function crawl(url) {
    return new Promise(function (resolve, reject) {
        leech.request(url)
        .then($ => {
            try {
                if (isList($)) {

                    // return SearchResult
                    var result = new SearchResult({
                        url: url
                    });

                    result.queryString = $(
                        $('input[name=search_word]')
                    ).attr('value');

                    $('table.tbllist.actress tr').each((idx, el) => {
                        if (idx == 0) {
                            // avoid header
                        } else {
                            var info = new HumanInfo();

                            var eleRoot = $(el).find('td')
                            
                            var ele = $(eleRoot[0]).find('a')
                            var u = $(ele).attr('href');

                            info.url = 
                                BASE_URL + '/' + u.substring(0, u.indexOf('?'));

                            ele = $(eleRoot[0]).find('img')
                            var p = $(ele).attr('src');
                            
                            info.photos.push(BASE_URL + p);

                            info.name = formatName(
                                $(eleRoot[1]).find('h2 > a').text(),
                                $(eleRoot[1]).find('p').text()
                            );

                            result.results.push(info);
                        }
                    });

                    if ($('div.pagination a').length > 0) {
                        result.more = true;
                    }

                    return resolve(result);
                } else {

                    // return HumanInfo
                    var info = new HumanInfo({
                        url: url
                    });

                    var ele = $('div.act-area'),
                        val = '';

                    // get photos =============================================
                    val = $($(ele).find('div.thumb img')).attr('src');
                    info.photos.push(BASE_URL + val);
                    // end photos =============================================

                    // get rating =============================================
                    if ($(ele).find('table.rate-table').length > 0) {
                        val = $($(ele).find('table.rate-table tr'))
                        info.rating.looks = 
                            formatFloat($($(val[0]).find('td')[2]).text());
                        info.rating.body = 
                            formatFloat($($(val[1]).find('td')[2]).text());
                        info.rating.cute = 
                            formatFloat($($(val[2]).find('td')[2]).text());
                        info.rating.fappable = 
                            formatFloat($($(val[3]).find('td')[2]).text());
                        info.rating.total = 
                            formatFloat($($(val[4]).find('td')[2]).text());
                    } else {
                        info.rating = null;
                    }
                    // end rating =============================================

                    ele = $('div.act-profile > table tr');

                    // get name, nicknames, alias =============================
                    val = $(ele[0]).find('td h2').text().split('（');
                    
                    info.name = formatName(
                        val[0].trim(),
                        val[1].substring(0, val[1].length - 1).trim()
                    );

                    if ($(ele).find('span:contains("愛称")').length > 0) {
                        $(ele).find('span:contains("愛称")').each(
                            (idx, el) => {
                                info.nicknames.push(
                                    formatName($(el.next).text().trim())
                                )
                            }
                        );
                    }

                    if ($(ele).find('span:contains("別名")').length > 0) {
                        $(ele).find('span:contains("別名")').each(
                            (idx, el) => {
                                info.aliases.push(
                                    formatName($(el.next).text().trim())
                                )
                            }
                        );
                    }
                    // end name, transname, nicknames, alias ==================

                    // get birthday, birthplace ===============================
                    val = $(
                        $(ele).find('span:contains("生年月日")')[0].next
                    ).text().trim();
                    if (val !== '') {
                        val = val.substring(0, val.indexOf('日'));
                        var y = val.split('年')[0],
                            m = val.split('年')[1].split('月')[0],
                            d = val.split('月')[1];

                        info.birthday = y + '-' + m + '-' + d;
                    }


                    val = $(
                        $(ele).find('span:contains("出身地")')[0].next
                    ).text();
                    if (val !== '') {
                        info.birthplace = JAPAN_PROVINE_JA_EN[val] + ', Japan';
                    }
                    // end birthday, birthplace ===============================

                    // get bio ================================================
                    val = $(
                        $(ele).find('span:contains("サイズ")')[0].next
                    ).text();
                    if (val !== '') {
                        val = val.split('/')

                        info.bio.tall = formatInt(val[0].trim().substring(1));

                        var b = val[1].trim().substring(1)
                        if (b !== '') {
                            info.bio.bust = formatInt(b.split('(')[0]);
                            info.bio.cup = b.split('(')[1][0];
                        }

                        info.bio.waist = formatInt(val[2].trim().substring(1));

                        info.bio.hip = formatInt(val[3].trim().substring(1));

                        info.bio.shoes = formatInt(val[4].trim().substring(1));
                    }

                    val = $(
                        $(ele).find('span:contains("血液型")')[0].next
                    ).text();
                    if (val !== '') {
                        info.bio.blood = val[0];
                    }
                    // end bio ================================================

                    // get tags ===============================================
                    val = $(
                        $(ele).find('div.tagarea a')
                    ).each((idx, el) => {
                        var e = $(el),
                            tag = {
                                text: e.text(),
                                url: e.attr('href')
                            };

                        info.tags.push(tag);
                    });
                    // end tags ===============================================

                    return resolve(info);
                }
            } catch (err) {
                return reject(err);
            }
        })
        .catch(err => {
            var mss = err.message;
            if (mss.indexOf('HTTP Code') > 0) {
                console.log('<' + mss + '> at ' + url)
                resolve(null);
            } else {
                reject(err);
            }
        })
    });
}

module.exports.crawl = crawl;
