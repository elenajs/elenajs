define([
    "./_SignalEmitter",
    "dojo/Stateful",
    "./promise/sync",
    "dojo/_base/declare"
], function(
        _SignalEmitter,
        Stateful,
        sync,
        declare
        ) {
    var Server = declare("elenajs._Router", [Stateful, _SignalEmitter], {
        dispatchers: [],        
        dispatch: function (req, res) {
                var signal = function(code, log) {
                    this.signal(req, res, code, log);
                };
                var matchers = [];
                var dispatchers = this.dispatchers;
                
                dispatchers.forEach(function(dispatcher) {
                    matchers.push(function () {
                       return dispatcher.match(req); 
                    });
                });

                sync(matchers, function (dispatcher) {return dispatcher;}).then(function (dispatcher) {
                    if (dispatcher) {
                        dispatcher.dispatch(req, res);
                    } else {
                        signal(404);
                    }
                }, function (err) {
                   signal(500, err); 
                });
                
            
        }
    });
    return Server;
});
