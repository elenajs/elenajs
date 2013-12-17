if (typeof process !== 'undefined' && typeof define === 'undefined') {
    var ejs = require('../lib/elenajs');
    var amdConfig = ejs.createConfig({
        packages: [
            {
                name: 'demo',
                location: __dirname
            }]
    });
    ejs.require(amdConfig, [__filename]);

} else {
    require([
        'demo/Server'
    ], function(Server) {
        var server = new Server();
        server.start();
    });
}
