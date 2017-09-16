'use strict';

const chai = require('chai');
var expect = require('chai').expect;

describe('crawlers/... test suite', function() {

    // disable time-out
    this.timeout(0);

    afterEach(function() {
        console.log();
    })

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

    describe('crawlers.caribbean test cases', function() {
        let crawler = require('../libs/crawlers/caribbean.js');
        
        it('should return data', function() {

            return crawler.crawl('https://www.caribbeancom.com/moviepages/091317-498/index.html')
            .then(data => {
                expect(data).to.not.be.null;
                if (data) {
                    console.log(JSON.stringify(data));
                }
            });
        })
    })

    describe('crawlers.caribbean-en1 test cases', function () {
        let crawler = require('../libs/crawlers/caribbean-en1.js');

        it('should return data', function() {
            
            return crawler.crawl('https://www.caribbeancom.com/eng/moviepages/091317-498/index.html')
            .then(data => {
                expect(data).to.not.be.null;
                if (data) {
                    console.log(JSON.stringify(data));
                }
            });
        })
    })

    describe('crawlers.caribbean-en2 test cases', function () {
        let crawler = require('../libs/crawlers/caribbean-en2.js');

        it('should return data', function() {
            
            return crawler.crawl('https://en.caribbeancom.com/eng/moviepages/091317-498/index.html')
            .then(data => {
                expect(data).to.not.be.null;
                if (data) {
                    console.log(JSON.stringify(data));
                }
            });
        })
    })

    describe('crawlers.1pondo test cases', function () {
        let crawler = require('../libs/crawlers/1pondo.js');

        it('should return data', function() {
            
            return crawler.crawl('https://www.1pondo.tv/dyn/ren/movie_details/movie_id/090217_575.json')
            .then(data => {
                expect(data).to.not.be.null;
                if (data) {
                    console.log(JSON.stringify(data));
                }
            });
        })
    })
});
