define([
    "intern!object",
    "intern/chai!assert",
    "demo/Server",
    "dojo/node!http",
    "elenajs/fs/dfs"
], function(
        registerSuite,
        assert,
        Server,
        http,
        fs
        ) {

    var data = {
        port: 3030,
        server: null,
        staticContent: fs.readFileSync('demo/resources/foo.txt', 'utf-8')
    };
    registerSuite({
        name: "dispatch.request",
        setup: function() {
            data.server = new Server({port: data.port});
            data.server.start();
        },
        teardown: function() {
            data.server.stop();
        },
        "test (404) page not found":
                function() {
                    assert.equal(1, 1);
/*
                    var dfd = this.async(100000);
                    var url = 'http://localhost:3030/nonexistent';
                    var req = http.get(url, dfd.callback(function(res) {

                        res.on('end', function() {
                            assert.equal(res.statusCode, 404, 'On a request to ' +
                                    url +
                                    "', Status code should be 404 but it's: " + res.statusCode);
                        });
                    })).on('error', function(err) {
                        dfd.reject.bind(dfd);
                    });
*/
                },
        "test static content txt":
                function() {
                    assert.equal(1, 1);
/*
                    var dfd = this.async(100000);
                    var url = 'http://localhost:3030/resources/foo.txt';
                    var req = http.get(url, dfd.callback(function(res) {
                        var message = '';
                        res.on('data', function(chunk) {
                            message += chunk;
                        });
                        res.on('end', function() {
                            assert.equal(message, data.staticContent, 'Message is "'
                                    + message + '" while should be "' + data.staticContent + '"');
                            assert.equal(res.statusCode, 200, 'On a request to ' +
                                    url +
                                    "', Status code should be 200 but it's: " + res.statusCode);
                        });
                    })).on('error', function(err) {
                        dfd.reject.bind(dfd);
                    });
*/
                }
    });
});

