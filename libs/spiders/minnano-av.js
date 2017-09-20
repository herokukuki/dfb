'use strict';

const clone = require('clone');
const util = require('../util.js');
const crawlers = require('../crawlers');

const { HumanInfo } = require('../../models/types.js');

const NAME = 'minnano-av';
module.exports.name = function () {
    return NAME;
}

const TARGET = 'human';
module.exports.target = function () {
    return TARGET;
}

function crawl (opt) {
    let crawler = crawlers["minnano-av"];
    return crawler.crawl(opt)
    .then(d => {
        if (d instanceof HumanInfo) {
            let infoids = d.names.filter(name => name.en)
            .map(name => {
                let param = name.en.split(' ');
                let infoid = param[0];

                if (param.length > 1) {
                    infoid = param[1].trim() + '-' + param[0].trim();
                }

                infoid = infoid.toLowerCase();

                return infoid;
            });

            return Promise.all(
                infoids.map(infoid => {
                    let crawler = crawlers["javmodel"];
                    return crawler.crawl({
                        type: 'id',
                        qtext: infoid
                    });
                })
            ).then(results => {
                let info = clone(d);

                let names = info.names;
                let birthday = info.birthday;
                let matched = results.filter(
                    res => 
                        res != null && 
                        res.birthday === birthday &&
                        names.some(v => v.og === res.name.og)
                );
                
                if (matched.length > 0) {
                    let dd = matched[0];
                    if (dd.photos.length > 0) {
                        info.photos = dd.photos;
                    }

                    if (dd.tags.length > 0) {
                        info.tags = dd.tags;
                    }
                }
                
                return info;
            });
        } else {
            return d;
        }
    });
}

module.exports.crawl = crawl;
