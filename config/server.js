'use strict';

const path = require('path');

const express = require('express');
const viewEngine = require('ejs-locals');

const app = express();

// Server Config ==========================================

app.engine('ejs', viewEngine);
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, '../statics')));

const humanRoute = require('../routes/human.js');
const movieRoute = require('../routes/movie.js');

// ========================================================

app.use('/human', humanRoute);
app.use('/movie', movieRoute);

app.use(function (err, req, res, next) {
    console.log(err);

    res.status(err.status || 500);
    res.end();
});

// Config for development =====================================================
if ( app.get('env') === 'development' ) {
    app.set('port', 3000);
}

// Config for development =====================================================
if ( app.get('env') === 'production' ) {
    app.set('port', 80);
}

module.exports = app;
