/* jshint -W097 */
/* jshint -W117 */
"use strict";

const { assert } = require("chai");
const {
    FixURL,
    extractDomain,
    getParameterByName,
    ValidURL,
    ArrayIntersection,
    readResponseAsText,
    readResponseAsJSON,
    validateResponse,
    getChromeVersion,
    getLocalIPs,
    bglog,
    isRestrictedUrl,
} = require("../js/functions");

describe("String.prototype.TrimToLength", function () {
    it("returns the string unchanged when shorter than the limit", function () {
        assert.equal("hello".TrimToLength(10), "hello");
    });
    it("returns the string unchanged when exactly at the limit", function () {
        assert.equal("hello".TrimToLength(5), "hello");
    });
    it("truncates and appends an ellipsis when longer than the limit", function () {
        assert.equal("hello world".TrimToLength(5), "hello...");
    });
});

describe("isRestrictedUrl", function () {
    it("allows a normal http URL", function () {
        assert.equal(isRestrictedUrl("http://example.com/page"), false);
    });
    it("allows a normal https URL", function () {
        assert.equal(isRestrictedUrl("https://example.com/watch?v=1"), false);
    });
    it("blocks chrome:// pages", function () {
        assert.equal(isRestrictedUrl("chrome://extensions/"), true);
    });
    it("blocks about: pages", function () {
        assert.equal(isRestrictedUrl("about:blank"), true);
    });
    it("blocks file:// URLs", function () {
        assert.equal(isRestrictedUrl("file:///C:/tmp/x.html"), true);
    });
    it("blocks the new Chrome Web Store", function () {
        assert.equal(isRestrictedUrl("https://chromewebstore.google.com/detail/abc"), true);
    });
    it("blocks the legacy Web Store URL", function () {
        assert.equal(isRestrictedUrl("https://chrome.google.com/webstore/detail/abc"), true);
    });
    it("treats an empty string as restricted", function () {
        assert.equal(isRestrictedUrl(""), true);
    });
    it("treats null as restricted", function () {
        assert.equal(isRestrictedUrl(null), true);
    });
});

describe("extractDomain (edge cases)", function () {
    it("strips only a leading www. (does not corrupt embedded www)", function () {
        assert.equal(extractDomain("subwww.example.com"), "subwww.example.com");
    });
    it("strips a leading www. after the protocol", function () {
        assert.equal(extractDomain("https://www.HelloACM.com/path"), "helloacm.com");
    });
    it("returns an empty string for an empty input", function () {
        assert.equal(extractDomain(""), "");
    });
    it("returns an empty string for null", function () {
        assert.equal(extractDomain(null), "");
    });
    it("returns an empty string for undefined", function () {
        assert.equal(extractDomain(undefined), "");
    });
});

describe("FixURL (edge cases)", function () {
    it("normalizes a backslash-escaped http URL", function () {
        assert.equal(FixURL("http:\\/\\/example.com"), "http://example.com");
    });
    it("normalizes a backslash-escaped https URL with a path", function () {
        assert.equal(FixURL("https:\\/\\/example.com\\/path"), "https://example.com/path");
    });
    it("leaves a short string untouched", function () {
        assert.equal(FixURL("//"), "//");
    });
});

describe("ValidURL (edge cases)", function () {
    it("rejects blob URLs", function () {
        assert.isFalse(ValidURL("blob:http://example.com/abc"));
    });
    it("rejects null", function () {
        assert.isFalse(ValidURL(null));
    });
    it("rejects undefined", function () {
        assert.isFalse(ValidURL(undefined));
    });
    it("rejects too-short URLs", function () {
        assert.isFalse(ValidURL("http://"));
    });
    it("accepts a backslash-escaped http URL", function () {
        assert.isTrue(ValidURL("http:\\/\\/helloacm.com/"));
    });
});

describe("getParameterByName (edge cases)", function () {
    it("returns an empty string for a present-but-empty parameter", function () {
        assert.equal(getParameterByName("a", "https://example.com/?a="), "");
    });
    it("returns null for a missing parameter", function () {
        assert.isNull(getParameterByName("a", "https://example.com/"));
    });
    it("decodes plus signs into spaces", function () {
        assert.equal(getParameterByName("foo", "https://example.com/?foo=bar+baz"), "bar baz");
    });
    it("decodes percent-encoded characters", function () {
        assert.equal(getParameterByName("foo", "https://example.com/?foo=bar%20baz"), "bar baz");
    });
});

describe("ArrayIntersection (edge cases)", function () {
    it("intersects arrays of strings", function () {
        assert.deepEqual(ArrayIntersection(["a", "b", "c"], ["b", "c", "d"]), ["b", "c"]);
    });
    it("de-duplicates the result", function () {
        assert.deepEqual(ArrayIntersection([1, 1, 2], [1]), [1]);
    });
    it("returns an empty array when there is no overlap", function () {
        assert.deepEqual(ArrayIntersection(["a"], ["b"]), []);
    });
});

describe("Array.prototype.uniq (edge cases)", function () {
    it("returns an empty array for an empty array", function () {
        assert.deepEqual([].uniq(), []);
    });
    it("preserves order while removing duplicates", function () {
        assert.deepEqual([3, 1, 3, 2, 1].uniq(), [3, 1, 2]);
    });
});

describe("readResponseAsText", function () {
    it("delegates to response.text()", function () {
        assert.equal(readResponseAsText({ text: () => "hello" }), "hello");
    });
});

describe("readResponseAsJSON", function () {
    it("delegates to response.json()", function () {
        assert.deepEqual(readResponseAsJSON({ json: () => ({ a: 1 }) }), { a: 1 });
    });
});

describe("validateResponse", function () {
    it("returns the response when ok", function () {
        const response = { ok: true, statusText: "OK" };
        assert.strictEqual(validateResponse(response), response);
    });
    it("throws when the response is not ok", function () {
        assert.throws(() => validateResponse({ ok: false, statusText: "Not Found" }), "Not Found");
    });
});

describe("getChromeVersion", function () {
    let originalDescriptor;
    beforeEach(function () {
        originalDescriptor = Object.getOwnPropertyDescriptor(globalThis, "navigator");
    });
    afterEach(function () {
        if (originalDescriptor) {
            Object.defineProperty(globalThis, "navigator", originalDescriptor);
        } else {
            delete globalThis.navigator;
        }
    });
    function stubNavigator(userAgent) {
        Object.defineProperty(globalThis, "navigator", {
            value: { userAgent },
            configurable: true,
            writable: true,
        });
    }
    it("returns the major version for a Chrome user agent", function () {
        try {
            stubNavigator("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/119.0.0.0 Safari/537.36");
        } catch {
            this.skip();
            return;
        }
        assert.equal(getChromeVersion(), 119);
    });
    it("returns false for a non-Chrome user agent", function () {
        try {
            stubNavigator("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15");
        } catch {
            this.skip();
            return;
        }
        assert.isFalse(getChromeVersion());
    });
});

describe("bglog", function () {
    afterEach(function () {
        delete global.chrome;
    });
    it("forwards the payload to chrome.runtime.sendMessage when available", function () {
        let sent = null;
        global.chrome = {
            runtime: {
                sendMessage: (message) => {
                    sent = message;
                },
            },
        };
        bglog("hello");
        assert.deepEqual(sent, { type: "bglog", obj: "hello" });
    });
    it("does nothing (and does not throw) when chrome is undefined", function () {
        assert.doesNotThrow(() => bglog("hello"));
    });
});

describe("getLocalIPs", function () {
    it("returns de-duplicated IPs and ignores unparsable candidates", function (done) {
        const handlers = {};
        const fakePc = {
            createDataChannel() {},
            createOffer(success) {
                success({});
            },
            setLocalDescription() {},
            close() {},
            set onicecandidate(fn) {
                handlers.onicecandidate = fn;
            },
        };
        const originalWindow = global.window;
        global.window = {
            RTCPeerConnection: function () {
                return fakePc;
            },
        };

        getLocalIPs(function (ips) {
            global.window = originalWindow;
            assert.deepEqual(ips, ["1.2.3.4"]);
            done();
        });

        // a valid candidate
        handlers.onicecandidate({ candidate: { candidate: "candidate:1 1 udp 1 1.2.3.4 5000 typ host" } });
        // a duplicate over a different transport
        handlers.onicecandidate({ candidate: { candidate: "candidate:1 1 tcp 1 1.2.3.4 5000 typ host" } });
        // an unparsable candidate exercises the null guard
        handlers.onicecandidate({ candidate: { candidate: "garbage" } });
        // gathering complete
        handlers.onicecandidate({ candidate: null });
    });
});
