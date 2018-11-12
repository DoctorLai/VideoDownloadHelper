/* jshint -W097 */
/* jshint -W117 */
'use strict';

const { assert } = require("chai");
let { FixURL, extractDomain, getParameterByName, ValidURL } = require('../js/functions');

describe('getParameterByName', function() {
    it('https://example.com/?a=b&c=d&e=f', function() {
        assert.equal('b', getParameterByName('a', 'https://example.com/?a=b&c=d&e=f'));
        assert.equal('d', getParameterByName('c', 'https://example.com/?a=b&c=d&e=f'));
        assert.equal('f', getParameterByName('e', 'https://example.com/?a=b&c=d&e=f'));
        assert.isNull(getParameterByName('ea', 'https://example.com/?a=b&c=d&e=f'));
    });   
});

describe('FixURL', function() {
    it('not a valid URL', function() {
        assert.equal('not a valid URL', FixURL('not a valid URL'));
    });   
    it('https://meipai.com', function() {
        assert.equal('https://meipai.com', FixURL('https://meipai.com'));
    });     
    it('//example.com', function() {
        assert.equal('http://example.com', FixURL('//example.com'));
    });       
    it('http:\/\/example.com', function() {
        assert.equal('http://example.com', FixURL('http:\/\/example.com'));
    });    
    it('http:\/\/example.com\/abc\/', function() {
        assert.equal('http://example.com/abc/', FixURL('http:\/\/example.com\/abc\/'));
    });             
});

describe('ValidURL', function() {
    it('https://helloacm.com/', function() {
        assert.isTrue(ValidURL("https://helloacm.com/"));
    });   
    it('aa://helloacm.com/', function() {
        assert.isFalse(ValidURL("aa://helloacm.com/"));
    });   
    it('', function() {
        assert.isFalse(ValidURL(""));
    });    
    it('https://helloacm.com/?a=b&c=d&w134', function() {
        assert.isTrue(ValidURL("https://helloacm.com/?a=b&c=d&w134"));
    });        
});

describe('extractDomain', function() {
    it('https://devhints.io/chai', function() {
        assert.equal("devhints.io", extractDomain("https://devhints.io/chai"));
    });
    it('helloacm.com', function() {
        assert.equal("helloacm.com", extractDomain("helloacm.com"));
    });    
    it('http://helloacm.com', function() {
        assert.equal("helloacm.com", extractDomain("http://helloacm.com"));
    });        
    it('helloacm.com:8080', function() {
        assert.equal("helloacm.com", extractDomain("helloacm.com:8080"));
    });   
    it('ftp://app.example.co.uk', function() {
        assert.equal("app.example.co.uk", extractDomain("ftp://app.example.co.uk"));
    });   
    it('www.helloacm.com:8080', function() {
        assert.equal("helloacm.com", extractDomain("www.helloacm.com:8080"));
    });      
    it('http://www.helloacm.com:8080', function() {
        assert.equal("helloacm.com", extractDomain("http://www.helloacm.com:8080"));
    });      
    it('http://www.HelloACM.com:8080', function() {
        assert.equal("helloacm.com", extractDomain("http://www.HelloACM.com:8080"));
    });      
    it('abc', function() {
        assert.equal("abc", extractDomain("abc"));
    });                 
});