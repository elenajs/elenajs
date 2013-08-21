/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if (typeof process !== 'undefined' && typeof define === 'undefined') {
	(function () {
		var req = require('dojo/dojo'),
			pathUtils = require('path'),
			basePath = pathUtils.dirname(process.argv[1]);

		req({
			baseUrl: pathUtils.resolve(basePath, '..', '..'),
			packages: [
				{ name: 'intern', location: basePath }
			],
			map: {
				intern: {
					dojo: 'intern/node_modules/dojo',
					chai: 'intern/node_modules/chai/chai'
				}
			}
		}, [ 'intern/client' ]);
	})();
}
