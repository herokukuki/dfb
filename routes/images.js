'use strict';

const cache = require('../config/cache.js');
const leech = require('../libs/leech-promise.js');

const express = require('express');
const router  = express.Router();

router.get('/:resid', (req, res) => {
    let resid = req.params['resid'];
    let url = cache.get('image', resid);
    if (url) {
        leech.pipe({
            url: url,
            target: res
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
