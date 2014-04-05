/**
 * Module _SignalEmitter.
 * @module elenajs/_SignalEmitter
 */
define([
    "dojo/Stateful",
    "dojo/Evented",
    "dojo/_base/declare",
    "./renderers/HttpErrorsRenderer",
    "./HttpDeferred",
], function(
        Stateful,
        Evented,
        declare,
        ErrorRenderer,
        HttpDeferred
        ) {
    var _SignalEmitter = declare("elenajs._SignalEmitter", [Stateful, Evented], {
        signal: function(request, response, code) {
                    var r = new ErrorRenderer({
                        httpDeferred: new HttpDeferred(request, response),
                        statusCode: code});
                    r.render();
        }
    });
    return _SignalEmitter;
});
