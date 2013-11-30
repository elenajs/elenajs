var amdConf = require('./_amd-autoconf'),
        amd = require('./_loader')();

module.exports = {
    createConfig: amdConf.createConfig,
    require: global.require
};
