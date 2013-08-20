define([
    "dojo/_base/declare",
    "dojo/Stateful",
    "../_Router",
    "dojo/Deferred"
], function(declare,
        Stateful,
        _Router,
        Deferred
        ) {
    var RequestDispatcher = declare("elenajs.dispatchers.RequestDispatcher", [Stateful, _Router], {
        chunkSize: 32768,
        matcher: /^.*/,
        match: function(req) {
            var deferred = new Deferred();
            try {
                deferred.resolve(req.url.match(this.matcher) && this);
            } catch (e) {
                deferred.reject(e);
            }
            return deferred.promise;
        }
    });
    return RequestDispatcher;
});
