define([
    "intern!object",
    "intern/chai!assert",
    "elenajs/promise/sync",
    "dojo/Deferred"
], function(registerSuite, assert, sync, Deferred) {
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
        "test Deferred synchronization":
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


                }
    });
});

