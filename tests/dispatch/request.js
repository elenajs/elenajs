define([
    "intern!object"
            , "intern/chai!assert"
            , "elenajs/Server"
            , "dojo/node!http"
], function(
        registerSuite
        , assert
        , Server
        , http
        ) {

    var data = {
        server: null,
        port: 3030
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
                    var dfd = this.async(1000);
                    var url = 'http://localhost:3030/nonexistent';
                    var req = http.get(url, dfd.callback(function (res) {
                        console.log('Response got!');
                        assert.equal(res.statusCode, 404, 'On a request to '+                       
                                url +                         
                               "', Status code should be 404 but it's: " + res.statusCode);
                    })).on('error', function(err) {
                        assert.fail(err, null, 'On a request to '+                   
                                url +                         
                                ', an error was thrown' + err);
                    });
                }
    });
});

