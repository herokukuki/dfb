'use strict';

const chai = require('chai');
var expect = require('chai').expect;

describe.only('spiders/... test suite', function() {

    // disable time-out
    this.timeout(0);

    afterEach(function() {
        console.log();
    })

    let test = function (spider, url) {
        describe('spiders.' + spider.name() + ' test cases', function() {
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
        describe.only('spiders.' + spider.name() + ' test cases', function() {
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

    let spiders = require('../libs/spiders');
    test(spiders['minnano-av'], {qtext: '竹内しずか【登', type: 'search'});
    test(spiders['caribbeancom'], {qtext: '091317-498', type: 'search'});
    test(spiders['heyzo'], {qtext: '0356', type: 'search'});
    test(spiders['dmm'], {qtext: 'AVOP-210', type: 'search'});
    test(spiders['dmm'], {qtext: 'AVOP 2', type: 'search'});
});
