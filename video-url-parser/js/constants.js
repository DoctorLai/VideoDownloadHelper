/* jshint -W097 */
"use strict";

const max_url_length = 95;

const steemit_domains = [
    'steempeak.com',
    'steemit.com', 
    'steemkr.com', 
    'cnsteem.com',
    'utopian.io',
    'staging.busy.org',
    'steemhunt.com',
    'mspsteem.com',
    'steemdb.com',
    'busy.org',
    'steemd.com'
];   

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
	module.exports = {
		max_url_length, steemit_domains
	};
}