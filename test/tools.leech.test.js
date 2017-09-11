'use strict';

const chai = require('chai');
const assert = chai.assert;

const fs = require('fs');
const path = require('path');
const leech = require('../libs/leech.js');

describe('leech.js test suite', function(done) {

    describe('func retrieve test cases', function () {
        it('should panic if directory path is not exist', function (done) {
            assert.throws(function (){
                var testpath = "E:\\temp\\non-exist";
                if (!fs.existsSync(testpath)) {
                    leech.retrieve('http://www.minnano-av.com/p_actress_125_125/009/432853.jpg', testpath
                    , err => {
                        if (err) throw err;
                        done();
                    });
                } else {
                    throw new Error("This path is existed, choose another path!");
                }
            }, done);
        })

        it('should save file with valid name', function (done) {
            var testpath = "E:\\temp"
            , filepath = "E:\\temp\\432853.jpg";

            if (!fs.existsSync(testpath)) {
                throw new Error("This path is not existed, create it!");
            }
            
            if (fs.existsSync(filepath)) {
                throw new Error("This file path is existed, delete it!");
            }

            assert.doesNotThrow(function() {
                leech.retrieve('http://www.minnano-av.com/p_actress_125_125/009/432853.jpg?new', testpath
                    , err => {
                        if (err) throw err;
                        assert.isTrue(fs.existsSync(filepath));
                        done();
                    });
            }, done);
        })

        it('should save big file', function (done) {
            var testpath = "E:\\temp"
            , filepath = "E:\\temp\\SomethingBigLogo.png";

            if (!fs.existsSync(testpath)) {
                throw new Error("This path is not existed, create it!");
            }
            
            if (fs.existsSync(filepath)) {
                throw new Error("This file path is existed, delete it!");
            }

            assert.doesNotThrow(function () {
                leech.retrieve('https://www.eventsfy.com/assets/images/artists/SomethingBigLogo.png', testpath
                    , err => {
                        if (err) throw err;
                        assert.isTrue(fs.existsSync(filepath));
                        done();
                    });
            }, done);
        })

        it('should panic if destination file path is existed', function (done) {
            assert.throws(function () {
                var testpath = "E:\\temp\\432853.jpg"
                if (fs.existsSync(testpath)) {
                    leech.retrieve('http://www.minnano-av.com/p_actress_125_125/009/432853.jpg', testpath
                    , err => {
                        if (err) throw err;
                        done();
                    });
                } else {
                    throw new Error("This path is not existed, create it!");
                }
            }, done);
        })
    });
});
