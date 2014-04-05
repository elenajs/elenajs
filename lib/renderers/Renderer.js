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
        httpDeferred: null,
        render: function(params) {
            throwAbstract();
        }
    });
    return Renderer;
});
