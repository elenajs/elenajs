define(["dojo/_base/declare",
    "dojo/Stateful",
    "dojo/Evented",
    "dojo/Deferred",
    "dojo/node!http",
    "dojo/node!url",
    "dojo/node!querystring",
    "dojo/node!formaline"
], function(declare,
        Stateful,
        Evented,
        Deferred,
        http,
        url,
        querystring,
        formaline) {
    var RequestDispatcher = declare("elenajs.RequestDispatcher", [Stateful, Evented], {
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
        },
        dispatch: function(req, res) {
            return null;
        }
    });
    return RequestDispatcher;
});
