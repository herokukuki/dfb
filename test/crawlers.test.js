'use strict';

const chai = require('chai');
var expect = require('chai').expect;

describe('crawlers/... test suite', function() {

    // disable time-out
    this.timeout(0);

    describe('crawlers.minnano-av test cases', function() {
        let crawler = require('../libs/crawlers/minnano-av.js');

        it('should return data', function() {
            
            return crawler.crawl('http://www.minnano-av.com/actress300706.html')
            .then(data => {
                expect(data).to.not.be.null;
                if (data) {
                    console.log(JSON.stringify(data));
                }
            });
        })
    })

    describe('crawlers.javmodel test cases', function() {
        let crawler = require('../libs/crawlers/javmodel.js');
        
        it('should return data', function() {

            return crawler.crawl('http://javmodel.com/jav/airu-oshima/')
            .then(data => {
                expect(data).to.not.be.null;
                if (data) {
                    console.log(JSON.stringify(data));
                }
            });
        })
    })

    describe('crawlers.wap test cases', function () {
        let crawler = require('../libs/crawlers/wap.js');

        it('should return data', function() {
            
            return crawler.crawl('http://warashi-asian-pornstars.fr/en/s-12/search', [ 'つぼみ' ])
            .then(data => {
                expect(data).to.not.be.null;
                if (data) {
                    console.log(JSON.stringify(data));
                }
            });
        })
    })
});
