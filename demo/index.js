if (typeof process !== 'undefined' && typeof define === 'undefined') {
    var ejs = require('../lib/elenajs');

//    amdConfig = ejs.createConfig({baseUrl: __dirname});
    amdConfig = ejs.createConfig({
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
