'use strict';

const SpiderQueen = require('../libs/spider-queen.js');
const { HumanName, HumanInfo, SearchResult } = require('../models/types.js');
const cache = require('../config/cache.js');
const util = require('../libs/util.js');

const express = require('express');
const router  = express.Router();

router.get('/', function (req, res) {
    let info = new HumanInfo({
        // Default value for testing

        url: 'http://www.minnano-av.com/actress432853.html',

        photos: [
            { url: 'http://cdn.javmodel.com/javdata/uploads/tsubomi150.jpg' }
        ],

        name: new HumanName({
            value: 'つぼみ',
            type: 'ja',
            hiragana: 'つぼみ',
            engname: 'Tsubomi',
        }),

        nicknames: [
            new HumanName({
                value: 'つぼみん',
                type: 'ja',
            })
        ],

        aliases: [

        ],

        birthday: '1987-12-25',

        birthplace: 'Yamaguchi, Japan',

        bio: {
            tall: 160,
            bust: 84,
            cup: 'D',
            waist: 58,
            hip: 85,
            shoes: '',
            blood: 'O'
        },

        rating: {
            looks: 8.54,
            body: 8.46,
            cute: 8.7,
            fappable: 8.54,
            total: 8.57,
        },

        tags: [
            { text: '美乳', url: 'http://www.minnano-av.com/actress_list.php?tag_a_id=28' },
            { text: '色白', url: 'http://www.minnano-av.com/actress_list.php?tag_a_id=36' },
            { text: '美白', url: 'http://www.minnano-av.com/actress_list.php?tag_a_id=73' },
            { text: 'ロリ顔', url: 'http://www.minnano-av.com/actress_list.php?tag_a_id=2681' },
        ],

        // ...
    });

    let info_cached = util.cacheImageURLs(info);

    res.render('human/details', info_cached);
});

router.get('/search', function (req, res) {
    const type = 'human';
    var query = util.replaceAll(req.query['q'], '+', ' ');

    var result = cache.get(type, query);
    if (result) {
        res.status(200).render('human/details', result);
    } else {
        SpiderQueen.crawl(query, {
            target: 'human',
            type: 'search'
        })
        .then(data => {
            let data_cached = util.cacheImageURLs(data);

            if (data_cached instanceof HumanInfo) {
                if (data_cached.photos.length == 0) {
                    data_cached.photos.push(
                        '/assets/images/noimageps.gif'
                    );
                }

                res.status(200).render('human/details', data_cached);

            } else if (data_cached instanceof SearchResult) {
                data_cached = util.cacheURLs(data_cached);
                data_cached.results.filter(v => v.photos.length == 0).forEach(d => {
                    d.photos.push(
                        '/assets/images/noimageps.gif'
                    );
                })

                if (data_cached.results.length == 0) {
                    res.status(200).render('human/list-notfound', data_cached);
                } else {
                    res.status(200).render('human/list', data_cached);
                }
                
            } else {
                res.status(404).end();
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).end();
        });
    }
});

router.get('/:infoid', function (req, res) {
    const infoid = util.replaceAll(req.params['infoid'], '+', ' ');

    let footprint = cache.get('id', infoid);
    if (footprint) {
        SpiderQueen.crawl(footprint.id, {
            target: 'human',
            type: 'id',
            assign: footprint.crawler,
        })
        .then(data => {
            let data_cached = util.cacheImageURLs(data);
    
            if (data_cached instanceof HumanInfo) {
                if (data_cached.photos.length == 0) {
                    data_cached.photos.push(
                        '/assets/images/noimageps.gif'
                    );
                }
                res.status(200).render('human/details', data_cached);

            } else {
                res.status(404).end();
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).end();
        });

    } else {
        res.status(404).end();
    }
    
});

module.exports = router;
