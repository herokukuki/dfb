'use strict';

const clone = require('clone');
const cache = require('../config/cache.js');
const leech = require('../libs/leech-promise.js');

const express = require('express');
const router  = express.Router();

router.get('/:resid', (req, res) => {
    let resid = req.params['resid'];
    let reqObj = cache.get('image', resid);
    if (reqObj) {
        let options = clone(reqObj);
        options['target'] = res;

        leech.pipe(options)
        .catch(err => {
            console.error(err);
            res.status(500).end();
        });
    } else {
        res.status(404).end();
    }
});

module.exports = router;
