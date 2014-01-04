define([
    "dojo/Stateful",
    "dojo/Evented",
    "dojo/_base/declare",
    "./renderers/HttpErrorsRenderer"
], function(
        Stateful,
        Evented,
        declare,
        ErrorRenderer
        ) {
    var _SignalEmitter = declare("elenajs._SignalEmitter", [Stateful, Evented], {
        signal: function(request, response, code) {
                    var r = new ErrorRenderer({
                        request: request,
                        response: response,
                        statusCode: code});
                    r.render();
        }
    });
    return _SignalEmitter;
});
