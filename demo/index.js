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
        'demo/Server',
        'dojo/on'
    ], function(Server, on) {
        var server = new Server();
        on(server, 'start', function() {
            console.log('server started on port: ' + server.port);
        });
        on(server, 'stop', function() {
            console.log('server stopped');
        });
        on(server, 'request', function(data) {
            console.info('Requiring: ' + data.response.statusCode + ' ' + data.request.url);
        });
        on(server, 'message', function(data) {
            console.info(data);
        });
        on(server, 'error', function(data) {
            console.error("ERROR - " +
                    data.response.statusCode + ' ' + data.request.url + ": "
                    + data.error);
        });

        server.start();
    });
}
