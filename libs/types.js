'use strict';

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