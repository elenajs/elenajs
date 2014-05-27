var amdConf = require('./_amd-autoconf'),
        amd = require('./_loader')();
/**
 * Module returning elenajs amd stuff.
 *
 */

/**
 * Module returning elenajs amd stuff.
 * This module esports:
 * <ul>
 *  <li> createConfig: a function that creates an
 *        AMD config reading nodejs package.json file and its dependencies.</li>
 *  <li> require: a replacement for nodes require function to allow the AMD one.</li>
 * </ul>
 * @module elenajs
 */
module.exports = {
    createConfig: amdConf.createConfig,
    require: global.require
};
