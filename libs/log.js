'use strict';

const fs = require('fs');

function writeToFile(content) {
    return new Promise(
        (resolve, reject) => {
            var filepath = './log.txt';
            fs.writeFile(filepath, content, 'utf8', err => {
                if (err) return reject(err);
                return resolve(err);
            });
        }
    )
}

module.exports.writeToFile = writeToFile;
