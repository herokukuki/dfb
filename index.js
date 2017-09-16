'use strict';

const path = require('path');

const express = require('express');
const viewEngine = require('ejs-locals');

const app = express();

// Server Config ==========================================

app.engine('ejs', viewEngine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'statics')));

const PORT = 3000;

const humanRoute = require('./routes/human.js');
const movieRoute = require('./routes/movie.js');

// ========================================================

app.use('/human', humanRoute);
app.use('/movie', movieRoute);

app.use(function (err, req, res, next) {
    console.log(err);

    res.status(err.status || 500);
    res.end();
});

app.listen(PORT, function () {
    console.log('Server is listening at ' + PORT + '...');
});