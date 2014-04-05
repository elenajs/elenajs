var amdConf = require('./_amd-autoconf'),
        amd = require('./_loader')();
/**
 * Module returning elenajs amd stuff.
 *
 */

/**
 * Module returning elenajs amd stuff.
 * This module esports:
 *      - createConfig function, a function that creates an
 * AMD config reading nodejs package.json file and its dependencies.
 *      - require a replacement for nodes require function to allow the AMD one.
 * @module elenajs
 */
module.exports = {
    createConfig: amdConf.createConfig,
    require: global.require
};
