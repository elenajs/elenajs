define([
    "dojo/_base/declare",
    "../_ErrorHandler"
], function(
        declare,
        _ErrorHandler
        ) {

    function throwAbstract(){
		throw new TypeError("abstract");
	}
    var Renderer = declare("elenajs.renderers.Renderer", [_ErrorHandler], {
        request: null,
        response: null,
        deferred: null,
        render: function(params) {
            throwAbstract();
        }/*,
        handleError: function(deferred, req, res, status, error) {
            this.inherited(arguments);
            this.signal(req, res, status);
        }*/
    });
    return Renderer;
});
