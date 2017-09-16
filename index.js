'use strict';

const app = require('./config/server.js');
const port = app.get('port');

app.listen(port, function () {
    console.log('Server is listening at ' + port + '...');
});
