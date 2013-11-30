define([
    "./_SignalEmitter",
    "./promise/sync",
    "dojo/_base/declare",
    "dojo/_base/array"
], function(
        _SignalEmitter,
        sync,
        declare,
        array
        ) {
    var _Router = declare("elenajs._Router", _SignalEmitter, {
        dispatchers: [],
        
        dispatch: function(req, res) {
            try {
                var self = this;
                
                var matchers = [];
                var dispatchers = this.dispatchers;

                array.forEach(dispatchers, function(dispatcher) {
                    matchers.push(function() {
                        return dispatcher.match(req);
                    });
                });

                sync(matchers, function(dispatcher) {
                    return dispatcher;
                }).then(function(dispatcher) {                    
                    if (dispatcher) {
                        dispatcher.dispatch(req, res);
                    } else {
                        self.signal(req, res, 404, "page not found: " + req.url);                        
                    }
                }, function(err) {
                    self.signal(req, res, 500, err);
                });
            } catch (err) {
                console.log(err);
            }

        }
    });
    return _Router;
});
