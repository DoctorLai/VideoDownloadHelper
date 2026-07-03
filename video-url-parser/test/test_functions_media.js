/* jshint -W097 */
/* jshint -W117 */
"use strict";

const { assert } = require("chai");
const {
    getMediaType,
    isVideoUrl,
    isAudioUrl,
    isImageUrl,
    isDownloadableMediaUrl,
    VIDEO_EXTENSIONS,
    AUDIO_EXTENSIONS,
    IMAGE_EXTENSIONS,
} = require("../js/functions");

describe("getMediaType", function () {
    it("classifies common video extensions as video", function () {
        assert.equal(getMediaType("https://cdn.example.com/a.mp4"), "video");
        assert.equal(getMediaType("https://cdn.example.com/a.webm?x=1"), "video");
        assert.equal(getMediaType("https://cdn.example.com/a.m3u8"), "video");
    });
    it("classifies common audio extensions as audio", function () {
        assert.equal(getMediaType("https://cdn.example.com/a.mp3"), "audio");
        assert.equal(getMediaType("https://cdn.example.com/a.flac"), "audio");
    });
    it("classifies common image extensions as image", function () {
        assert.equal(getMediaType("https://cdn.example.com/a.JPG"), "image");
        assert.equal(getMediaType("https://cdn.example.com/a.webp"), "image");
    });
    it("returns an empty string for unknown or missing extensions", function () {
        assert.equal(getMediaType("https://cdn.example.com/watch"), "");
        assert.equal(getMediaType("https://cdn.example.com/a.txt"), "");
        assert.equal(getMediaType(null), "");
    });
});

describe("media URL predicates", function () {
    it("isVideoUrl", function () {
        assert.isTrue(isVideoUrl("https://x.com/a.mkv"));
        assert.isFalse(isVideoUrl("https://x.com/a.mp3"));
    });
    it("isAudioUrl", function () {
        assert.isTrue(isAudioUrl("https://x.com/a.m4a"));
        assert.isFalse(isAudioUrl("https://x.com/a.mp4"));
    });
    it("isImageUrl", function () {
        assert.isTrue(isImageUrl("https://x.com/a.png"));
        assert.isFalse(isImageUrl("https://x.com/a.mp4"));
    });
    it("isDownloadableMediaUrl is true for any known media type", function () {
        assert.isTrue(isDownloadableMediaUrl("https://x.com/a.mp4"));
        assert.isTrue(isDownloadableMediaUrl("https://x.com/a.mp3"));
        assert.isTrue(isDownloadableMediaUrl("https://x.com/a.png"));
        assert.isFalse(isDownloadableMediaUrl("https://x.com/page.html"));
    });
});

describe("media extension lists", function () {
    it("expose non-empty, lowercase, de-duplicated arrays", function () {
        [VIDEO_EXTENSIONS, AUDIO_EXTENSIONS, IMAGE_EXTENSIONS].forEach((list) => {
            assert.isArray(list);
            assert.isAbove(list.length, 0);
            list.forEach((ext) => {
                assert.isString(ext);
                assert.equal(ext, ext.toLowerCase());
            });
            assert.equal(list.length, new Set(list).size, "no duplicates within a list");
        });
    });
    it("do not overlap between kinds", function () {
        const audio = new Set(AUDIO_EXTENSIONS);
        const image = new Set(IMAGE_EXTENSIONS);
        VIDEO_EXTENSIONS.forEach((ext) => {
            assert.isFalse(audio.has(ext), ext + " is in both video and audio");
            assert.isFalse(image.has(ext), ext + " is in both video and image");
        });
        AUDIO_EXTENSIONS.forEach((ext) => {
            assert.isFalse(image.has(ext), ext + " is in both audio and image");
        });
    });
});
