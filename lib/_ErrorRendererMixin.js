define([
    "dojo/_base/declare",
    "./_SignalEmitter",
    "./_ErrorHandler"
], function(
        declare,
        _SignalEmitter,
        _ErrorHandler
        ) {

    var _ErrorRendererMixin = declare("elenajs._ErrorRendererMixin", [_SignalEmitter, _ErrorHandler], {
        handleError: function(req, res, deferred, status, error) {
            this.inherited(arguments);
            this.signal(req, res, status);
        }
    });
    return _ErrorRendererMixin;
});
