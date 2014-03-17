var amdConf = require('./_amd-autoconf'),
        amd = require('./_loader')();
/**
 * Module returning elenajs amd stuff.
 * 
 */
module.exports = {
    createConfig: amdConf.createConfig,
    require: global.require
};
