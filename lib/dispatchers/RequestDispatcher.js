define([
    "dojo/_base/declare",
    "./_Dispatcher",
    "../_ErrorRendererMixin",
    "dojo/Deferred",
    "dojo/node!url"
], function(declare,
        _Dispatcher,
        _ErrorRendererMixin,
        Deferred,
        url
        ) {
    function throwAbstract(){
		throw new TypeError("abstract");
	}
    var RequestDispatcher = declare("elenajs.dispatchers.RequestDispatcher", [_Dispatcher, _ErrorRendererMixin], {
        matcher: /^.*/,
        match: function(req) {
            var deferred = new Deferred();
            try {
                deferred.resolve(url.parse(req.url).pathname.match(this.matcher) && this);
            } catch (e) {
                deferred.reject(e);
            }
            return deferred.promise;
        },
        dispatch: function(req, res, deferredPointer) {
            var self = this;
            var deferred = deferredPointer || new Deferred();
            try {
                self.render(req, res, deferred);
            } catch (err) {
                self.handleError(deferred, req, res, 500, err);
            }
            return deferred;
        },
        render: function(req, res, deferredPointer) {
            throwAbstract();
        }
    });
    return RequestDispatcher;
});
