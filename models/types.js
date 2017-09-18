'use strict';

const clone = require('clone');

// HumanName: object for saving human name
class HumanName {
    constructor(opt) {
        var op = {};
        if (opt && typeof opt === 'object') {
            op = opt;
        }

        this.value = opt.value || '';
        this.type = opt.type || '';
        this.hiragana = opt.hiragana || '';
        this.engname = opt.engname || '';
    }

    get og() {
        return this.value || '';
    }

    get en() {
        return this.engname || '';
    }
}

module.exports.HumanName = HumanName;

// HumanInfo: object contain some infomation of human.
class HumanInfo {
    constructor(opt) {
        var op = {};
        if (opt && typeof opt === 'object') {
            op = opt;
        }
        this.name = op.name || {};
        this.nicknames = op.nicknames || [];
        this.aliases = op.aliases || [];
        this.birthday = op.birthday || '';
        this.birthplace = op.birthplace || '';
        this.bio = {
            tall: op['bio.tall'] || '',
            bust: op['bio.bust'] || '',
            cup: op['bio.cup'] || '',
            waist: op['bio.waist'] || '',
            hip: op['bio.hip'] || '',
            shoes: op['bio.shoes'] || '',
            blood: op['bio.blood'] || '',
        };
        this.photos = op.photos || [];
        this.url = op.url || '';
        this.rating = {
            looks: op['rating.looks'] || 0,
            body: op['rating.body'] || 0,
            cute: op['rating.cute'] || 0,
            fappable: op['rating.fappable'] || 0,
            total: op['rating.total'] || 0,
        };
        this.tags = op.tags || [];
    }

    get names() {
        var result = [];
        result.push(clone(this.name));
        result = result.concat(clone(this.nicknames));
        result = result.concat(clone(this.aliases));

        return result;
    }
}

module.exports.HumanInfo = HumanInfo;

// SearchResult contain data of searching.
class SearchResult {
    constructor(opt) {
        var op = {};
        if (opt && typeof opt === 'object') {
            op = opt;
        }
        this.url = op.url || '';
        this.queryString = op.queryString || '';
        this.results = op.results || [];
        this.more = op.more || false;
    }
}

module.exports.SearchResult = SearchResult;

// MovieInfo contains some infomation about movie
class MovieInfo {
    constructor(opt) {
        var op = {};
        if (opt && typeof opt === 'object') {
            op = opt;
        }
        this.title = op.title || '';
        this.origtitle = op.origtitle || '';
        this.transtitle = op.transtitle || '';
        this.aka = op.aka || [];
        this.releasedate = op.releasedate || '';
        this.year = op.year || '';
        this.genres = op.genres || [];
        this.tags = op.tags || [];
        this.actors = op.actors || [];
        this.director = op.director || null;
        this.rating = op.rating || 0;
        this.posters = op.posters || [];
        this.screenshots = op.screenshots || [];
        this.covers = op.covers || [];
        this.url = op.url || '';

        this.country = op.country || '';
        this.origlang = op.origlang || '';
        
        this.series = op.series || null;

        // studio or something
        this.maker = op.maker || null;

        // for jav
        this.label = op.label || null;
        this.provider = op.provider || null;

        this.description = op.description || '';

        // imdb
        this.tagline = op.tagline || '';

        this.duration = op.duration || '';
    }
}

module.exports.MovieInfo = MovieInfo;
