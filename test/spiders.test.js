'use strict';

const chai = require('chai');
var expect = require('chai').expect;

describe('spiders/... test suite', function() {

    // disable time-out
    this.timeout(0);

    afterEach(function() {
        console.log();
    })

    let summon = function () {
        let spiders = {};
        let nest = require('../libs/spider-queen.js').spiders;
        for (var spider of nest) {
            let name = spider.name;
            spiders[name] = spider;
        }
        return spiders;
    }

    let test = function (spider, url) {
        describe('spiders.' + spider.name + ' test cases', function() {
            it('should return data', function() {
                
                return spider.crawl(url)
                .then(data => {
                    expect(data).to.not.be.null;
                    if (data) {
                        console.log(JSON.stringify(data));
                    }
                });
            })
        });
    };

    test.only = function (spider, url) {
        describe.only('spiders.' + spider.name + ' test cases', function() {
            it('should return data', function() {
                
                return spider.crawl(url)
                .then(data => {
                    expect(data).to.not.be.null;
                    if (data) {
                        console.log(JSON.stringify(data));
                    }
                });
            })
        });
    };

    let spiders = summon();
    test(spiders['dmm'], {qtext: 'AVOP-210', type: 'search'});
    test(spiders['dmm'], {qtext: 'AVOP 2', type: 'search'});
});
