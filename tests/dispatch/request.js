define([
    "intern!object",
    "intern/chai!assert",
    "demo/Server",
    "dojo/node!http"
], function(
        registerSuite,
        assert,
        Server,
        http
        ) {

    var data = {
        port: 3030,
        server: null
    };

    registerSuite({
        name: "dispatch.request",
        setup: function() {
            data.server = new Server({port: data.port});
            data.server.start();
        },
        teardown: function() {
//            data.server.stop();
        },
        "test (404) page not found":
                function() {
                    assert.equal(1,1);
                    
                    var dfd = this.async(100000);
                    var url = 'http://localhost:3030/nonexistent';
                    var req = http.get(url, dfd.callback(function(res) {
                        assert.equal(res.statusCode, 404, 'On a request to ' +
                                url +
                                "', Status code should be 404 but it's: " + res.statusCode);                        
                    })).on('error', function(err) {
                        dfd.reject.bind(dfd);
                    });
                    
                }
    });
});

