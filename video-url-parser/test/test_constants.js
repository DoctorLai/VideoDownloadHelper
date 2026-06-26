/* jshint -W097 */
/* jshint -W117 */
"use strict";

const { assert } = require("chai");
const { max_url_length, steemit_domains } = require("../js/constants");

describe("constants", function () {
    it("exposes a positive numeric max_url_length", function () {
        assert.isNumber(max_url_length);
        assert.isAbove(max_url_length, 0);
    });
    it("exposes the list of Steem domains", function () {
        assert.isArray(steemit_domains);
        assert.include(steemit_domains, "steemit.com");
        assert.include(steemit_domains, "busy.org");
    });
    it("contains only non-empty lowercase domain strings", function () {
        steemit_domains.forEach((domain) => {
            assert.isString(domain);
            assert.isAbove(domain.length, 0);
            assert.equal(domain, domain.toLowerCase());
        });
    });
});
