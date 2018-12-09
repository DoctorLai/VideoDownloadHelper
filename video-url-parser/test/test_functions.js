/* jshint -W097 */
/* jshint -W117 */
'use strict';

const { assert } = require("chai");
const { FixURL, extractDomain, getParameterByName, ValidURL, ArrayIntersection } = require('../js/functions');

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
    it('null', function() {
        assert.equal(null, FixURL(null));
    });                   
    it('undefined', function() {
        assert.equal(undefined, FixURL(undefined));
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

describe('ValidURL (Array)', function() {
    it('https://helloacm.com/', function() {
        assert.isTrue(ValidURL(["https://helloacm.com/", "https://helloacm.com/"]));
    });   
    it('aa://helloacm.com/', function() {
        assert.isFalse(ValidURL(["aa://helloacm.com/", "https://helloacm.com/"]));
    });   
    it('', function() {
        assert.isFalse(ValidURL(["", null]));
    });    
    it('https://helloacm.com/?a=b&c=d&w134', function() {
        assert.isTrue(ValidURL(["https://helloacm.com/?a=b&c=d&w134", "https://www.google.com"]));
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

describe('Array.prototype.uniq', function() {
    it('[1,2,2,3]', function() {
        assert.deepEqual([1,2,2,3].uniq(), [1, 2, 3]);
    });   
    it('[1,"2",2,3]', function() { 
        assert.deepEqual([1,"2",2,3].uniq(), [1, "2", 2, 3]);
    });       
    it('["https://domain1.com", "https://domain1.com", "https://domain1.com"]', function() { 
        assert.deepEqual(["https://domain1.com", "https://domain1.com", "https://domain1.com"].uniq(), ["https://domain1.com"]);
    });       
    it('["https://domain1.com", "https://domain2.com", "https://domain1.com"]', function() { 
        assert.deepEqual(["https://domain1.com", "https://domain2.com", "https://domain1.com"].uniq(), ["https://domain1.com", "https://domain2.com"]);
    });       
});

describe('ArrayIntersection', function() {
    it('[1,2,2,3], [2,3,4]', function() {
        assert.deepEqual(ArrayIntersection([1, 2, 2, 3], [2, 3, 4]), [2, 3]);
    }); 
    it('[1], [2]', function() {
        assert.deepEqual(ArrayIntersection([1], [2]), []);
    });     
    it('[2], [2]', function() {
        assert.deepEqual(ArrayIntersection([2], [2]), [2]);
    }); 
    it('[2], []', function() {
        assert.deepEqual(ArrayIntersection([2], []), []);
    });   
});