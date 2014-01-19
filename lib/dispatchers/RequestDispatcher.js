define([
    "dojo/_base/declare",
    "./_Dispatcher",
    "./RequestProcessor",
    "../_ErrorRendererMixin",
    "dojo/Deferred",
    "dojo/node!url"
], function(declare,
        _Dispatcher,
        RequestProcessor,
        _ErrorRendererMixin,
        Deferred,
        url
        ) {
    function throwAbstract(){
		throw new TypeError("abstract");
	}
    var RequestDispatcher = declare("elenajs.dispatchers.RequestDispatcher", [_Dispatcher, _ErrorRendererMixin, RequestProcessor], {
        match: function(req) {
            var deferred = new Deferred();
            try {
                var pathname = url.parse(req.url).pathname;
                var isMatching = pathname.match(this.matcher) &&
                        (!this.antiMatcher || !pathname.match(this.antiMatcher));
                deferred.resolve(isMatching && this);
            } catch (e) {
                deferred.reject(e);
            }
            return deferred;
        },
        dispatch: function(req, res, deferredPointer) {
            var self = this;
            var deferred = deferredPointer || new Deferred();
            try {
                self.render(req, res, deferred);
            } catch (err) {
                self.handleError(req, res, deferred, 500, err);
            }
            return deferred;
        },
        render: function(req, res, deferredPointer) {
            throwAbstract();
        }
    });
    return RequestDispatcher;
});
