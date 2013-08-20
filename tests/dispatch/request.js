define([
    "intern!object",
    "intern/chai!assert",
    "elenajs/Server"//,
    //"dojo/node!http"
], function(registerSuite, assert, Server/*, http*/) {

    registerSuite({
        name: "dispatch.request",
        server: null,
        serverPort: 3030,
        setup: function() {
            this.server = new Server();
            this.server.start();
        },
        teardown: function() {
            this.server.close();
        },
        "test (404) page not found":
                function() {
//                    var dfd = this.async(1000), self = this;
//                    var options = {
//                        hostname: 'localhost',
//                        port: self.serverPort,
//                        path: '/notexistent',
//                        method: 'GET'
//                    };
//                    var req = http.request(options, dfd.callback(function (res) {
//                        console.log('Response got!');
//                        assert.assertEqual(res.statusCode == '404', 'On a request to '+
//                                'http://localhost:' + options.port + options.path +                         
//                                ', Status code should be 404 but it\'s: ' + res.statusCode);
//                    })).on('error', function(err) {
//                        assert.fail(err, null, 'On a request to '+
//                                'http://localhost:' + options.port + options.path +                         
//                                ', an error was thrown' + err);
//                    });
                }
    });
});

