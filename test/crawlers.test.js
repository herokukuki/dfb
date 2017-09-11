'use strict';

const chai = require('chai');
var expect = require('chai').expect;

describe.only('crawlers/... test suite', function() {

    describe('crawlers.minnano-av test cases', function() {
        const crawler = require('../libs/crawlers/minnano-av.js');

        it('should return data', function() {
            
            return crawler.crawl('http://www.minnano-av.com/actress300706.html')
            .then(data => {
                expect(data).to.not.be.null;
                if (data) {
                    console.log(data);
                }
            });
        })
    })

    describe('crawlers.javmodel test cases', function() {
        const crawler = require('../libs/crawlers/javmodel.js');
        
        it('should return data', function() {

            return crawler.crawl('http://javmodel.com/jav/airu-oshima/')
            .then(data => {
                expect(data).to.not.be.null;
                if (data) {
                    console.log(data);
                }
            });
        })
    })
});
