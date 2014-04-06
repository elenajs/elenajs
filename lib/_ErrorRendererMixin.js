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
        handleError: function(deferred, status, error) {
            this.inherited(arguments);
            this.signal(deferred.get('httpRequest'), deferred.get('httpResponse'), status);
        }
    });
    return _ErrorRendererMixin;
});
