'use strict';

const SpiderQueen = require('../libs/spider-queen.js');
const { MovieInfo, SearchResult } = require('../models/types.js');
const cache = require('../config/cache.js');
const util = require('../libs/util.js');

const express = require('express');
const router  = express.Router();

router.get('/', (req, res) => {
    let info = new MovieInfo({
        // Default value for testing

        url: 'https://www.caribbeancom.com/moviepages/091317-498/index.html',

        title: 'caribbeancom 091317-498',
        origtitle: 'THE 未公開 ～葵千恵と千野くるみに罵られたい～',
        transtitle: 'The Undisclosed: Scolding By Chie Aoi And Kurumi Chino',

        releasedate: '2017-09-13',
        year: '2017',

        country: 'Japan',
        origlang: 'Japanese',

        genres: [
            {url: "", text: "Pornstar"},
            {url: "", text: "Older women"},
            {url: "", text: "Nice legs"},
            {url: "", text: "Nice titties"},
            {url: "", text: "Nice ass"},
            {url: "", text: "Titty Fuck"},
            {url: "", text: "Fellatio"},
            {url: "", text: "Hand job"},
            {url: "", text: "Original"}
        ],

        tags: [],

        actors: [
            {url: 'https://www.caribbeancom.com/search/%B0%AA%C0%E9%B7%C3/1.html', text: '葵千恵'},
            {url: 'https://www.caribbeancom.com/search/%C0%E9%CC%EE%A4%AF%A4%EB%A4%DF/1.html', text: '千野くるみ'}
        ],

        director: null,

        rating: 10,

        posters: [
            "https://www.caribbeancom.com/moviepages/091317-498/images/l_l.jpg"
        ],

        screenshots: [
            "https://www.caribbeancom.com/moviepages/091317-498/images/l/001.jpg",
            "https://www.caribbeancom.com/moviepages/091317-498/images/l/002.jpg"
        ],

        covers: [],

        series: {
            url: 'https://www.caribbeancom.com/series/187/index.html',
            text: 'THE 未公開'
        },

        maker: 'カリビアンコム',

        label: null,

        description: 'Chie Aoi And Kurumi Chino played a great lesbian in the previous video but got negative feedback. They insult a man looks like a director or an actor. As 2 sadists in the micro underwears, they rub pussy for each other and play lesbian again with great acting. Good for all masochist men.',

        tagline: '',

        duration: '00:19:54',
    });

    let info_cached = util.cacheImageURLs(info);

    res.render('movie/details', info_cached);
});

router.get('/search', (req, res) => {
    const type = 'movie';
    let query = util.replaceAll(req.query['q'], '+', ' ');

    SpiderQueen.crawl(query, {
        target: 'movie',
        type: 'search'
    })
    .then(data => {
        let data_cached = util.cacheImageURLs(data);

        if (data instanceof MovieInfo) {
            res.render('movie/details', data_cached);
        } else {
            res.status(404).end();
        }
    })
    .catch(err => {
        console.error(err);
        res.status(500).end();
    });
});

module.exports = router;
