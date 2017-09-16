'use strict';

const chai = require('chai');
const assert = chai.assert;

const types = require('../models/types.js');

describe('types.js test suite', function() {

    describe('HumanInfo test cases', function () {

        const HumanInfo = types.HumanInfo;
        it('should return HumanInfo when call {}.constructor.name', function() {
            var o = new HumanInfo();
            assert.equal(o.constructor.name, 'HumanInfo');
        });
    });

    describe('SearchResult test cases', function () {

        const SearchResult = types.SearchResult;
        it('should return SearchResult when call {}.constructor.name', function() {
            var o = new SearchResult();
            assert.equal(o.constructor.name, 'SearchResult');
        });
    });
});
