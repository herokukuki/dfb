'use strict';

const chai = require('chai');
var expect = require('chai').expect;

describe('crawlers/... test suite', function() {

    // disable time-out
    this.timeout(0);

    afterEach(function() {
        console.log();
    })

    let test = function (crawler, url) {
        describe('crawlers.' + crawler.name() + ' test cases', function() {
            it('should return data', function() {
                
                return crawler.crawl(url)
                .then(data => {
                    expect(data).to.not.be.null;
                    if (data) {
                        console.log(JSON.stringify(data));
                    }
                });
            })
        });
    };

    test.only = function (crawler, url) {
        describe.only('crawlers.' + crawler.name() + ' test cases', function() {
            it('should return data', function() {
                
                return crawler.crawl(url)
                .then(data => {
                    expect(data).to.not.be.null;
                    if (data) {
                        console.log(JSON.stringify(data));
                    }
                });
            })
        });
    };

    let crawlers = require('../libs/crawlers');
    test(crawlers['minnano-av'], 'http://www.minnano-av.com/actress300706.html');
    test(crawlers['javmodel'], 'http://javmodel.com/jav/airu-oshima/');
    test(crawlers['wap'], 'つぼみ');
    test(crawlers['caribbeancom'], 'https://www.caribbeancom.com/moviepages/091317-498/index.html');
    test(crawlers['caribbeancom-en1'], 'https://www.caribbeancom.com/eng/moviepages/091317-498/index.html');
    test(crawlers['caribbeancom-en2'], 'https://en.caribbeancom.com/eng/moviepages/091317-498/index.html');
    test(crawlers['1pondo'], 'https://www.1pondo.tv/dyn/ren/movie_details/movie_id/090217_575.json');
    test(crawlers['heyzo'], 'http://www.heyzo.com/moviepages/0356/index.html');
    test(crawlers['heyzo-en'], 'http://en.heyzo.com/moviepages/0356/index.html');
    test(crawlers['caribbeancompr'], 'http://www.caribbeancompr.com/moviepages/092916_003/index.html');
    test(crawlers['10musume'], 'http://www.10musume.com/moviepages/060317_01/index.html');
});
