define([
    "./_ErrorHandler",
    "dojo/_base/declare"
], function(
        _ErrorHandler,
        declare
        ) {
    function throwAbstract(){
		throw new TypeError("abstract");
	}

    var _Router = declare("elenajs._Router", _ErrorHandler, {
        dispatchers: [],
        match: function(req) {
            throwAbstract();
        },
        dispatch: function(req, res, deferredPointer) {
            throwAbstract();
        }
    });
    return _Router;
});
