define([
    "./renderers/HttpErrorsRenderer",
    "dojo/Stateful",
    "dojo/_base/declare"
], function(
        ErrorRenderer,
        Stateful,
        declare
        ) {
    var _SignalEmitter = declare("elenajs._SignalEmitter", [Stateful], {
        signal: function(request, response, code, log) {            
                    log && console.log(log);
                    var r = new ErrorRenderer({
                        request: request,
                        response: response,
                        statusCode: code});
                    r.render();
        }
    });
    return _SignalEmitter;
});
