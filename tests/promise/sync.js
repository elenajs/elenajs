define([
    "intern!object",
    "intern/chai!assert",
    "elenajs/promise/sync",
    "elenajs/HttpDeferred",
    "dojo/Deferred",
    "dojo/promise/Promise"
], function(registerSuite, assert, sync, HttpDeferred, Deferred, Promise) {
    var makeDeferred = function(val) {
        return function() {
            var d = new Deferred();
            setTimeout(function() {
                if (val > 0) {
                    d.resolve(val);
                } else {
                    d.reject(val);
                }
            }, 100);

            return d.promise;
        };
    };

    registerSuite({
        name: "promise.sync",
        "test sync is a Deferred":
                function() {
                    var s = sync([], function() {
                        return undefined;
                    });
                    assert.isTrue(s.toString().match(/Deferred/).length > 0, "sync does NOT return a dojo/Deferred");
                },
        "test sync":
                function() {
                    var dfd = this.async(1000);
                    var f1 = makeDeferred(1),
                            f2 = makeDeferred(2),
                            f3 = makeDeferred(3);
                    sync([f1, f2, f3], function(val) {
                        return val > 1;
                    }).then(dfd.callback(
                            function(val) {
                                assert.isTrue(2 === val, "Expected 2 while got " + val);
                            }, dfd.reject.bind(dfd)));
                },
        "test sync on empty array":
                function() {
                    var dfd = this.async(1000);
                    var s = sync([], function() {
                        return undefined;
                    });
                    s.then(dfd.callback(
                            function(val) {
                                assert.isTrue(val === undefined, "Expected undefined on empty array while got " + val);
                            }, dfd.reject.bind(dfd)));
                },
        "test sync none matches":
                function() {
                    var dfd = this.async(1000);
                    var f1 = makeDeferred(1),
                            f2 = makeDeferred(2),
                            f3 = makeDeferred(3);
                    sync([f1, f2, f3], function(val) {
                        return val > 4;
                    }).then(dfd.callback(
                            function(val) {
                                assert.isTrue(val === undefined, "Expected undefined while got " + val);
                            }, dfd.reject.bind(dfd)));
                },
        "test deferred object":
                function() {
                    var req = {status: 200}, res = {},
                            dfd = new HttpDeferred({httpRequest: req, httpResponse: res});

                    assert.isTrue(dfd.httpRequest.status === 200, "Expected undefined while got " + dfd.httpRequest.status)

                }
    });
});

