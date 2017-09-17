'use strict';

function formatText (str) {
    return str.replace(/\s\s+/g, ' ').trim();
}

module.exports.formatText = formatText;
