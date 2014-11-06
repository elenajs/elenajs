define([
    "../declare",
    "./Renderer",
    "../template!./templates/HttpErrorsRenderer.html"
], function (declare,
    Renderer,
    template
    ) {
    /**
     * Module returning a standard error Renderer.<br>
     * The render method simply shows the status code and the relative status message.
     *
     * @mixes elenajs/renderers/Renderer
     *
     * @module elenajs/renderers/HttpErrorsRenderer
     *
     */
    var HttpErrorsRenderer = declare("elenajs.renderers.HttpErrorsRenderer", Renderer, {
        templateObj: template,
        _status: {
            "100": "Continue",
            "101": "Switching Protocols",
            "102": "Processing",
            "200": "OK",
            "201": "Created",
            "202": "Accepted",
            "203": "Non-Authoritative Information",
            "204": "No Content",
            "205": "Reset Content",
            "206": "Partial Content",
            "207": "Multi-Status",
            "299": "Aborted",
            "300": "Multiple Choices",
            "301": "Moved Permanently",
            "302": "Found",
            "303": "See Other",
            "304": "Not Modified",
            "305": "Use Proxy",
            "307": "Temporary Redirect",
            "400": "Bad Request",
            "401": "Unauthorized",
            "402": "Payment Required",
            "403": "Forbidden",
            "404": "Not Found",
            "405": "Method Not Allowed",
            "406": "Not Acceptable",
            "407": "Proxy Authentication Required",
            "408": "Request Timeout",
            "409": "Conflict",
            "410": "Gone",
            "411": "Length Required",
            "412": "Precondition Failed",
            "413": "Payload Too Large",
            "414": "URI Too Long",
            "415": "Unsupported Media Type",
            "416": "Range Not Satisfiable",
            "417": "Expectation Failed",
            "422": "Unprocessable Entity",
            "423": "Locked",
            "424": "Failed Dependency",
            "426": "Upgrade Required",
            "428": "Precondition Required",
            "429": "Too Many Requests",
            "431": "Request Header Fields Too Large",
            "500": "Internal Server Error",
            "501": "Not Implemented",
            "502": "Bad Gateway",
            "503": "Service Unavailable",
            "504": "Gateway Time-out",
            "505": "HTTP Version Not Supported",
            "507": "Insufficient Storage",
            "511": "Network Authentication Required"
        },
        /**
         * HTTP default status code
         * @default 500
         * @type {!int}
         * @instance
         */
        defaultStatusCode: 500,
        /**
         * This is the function that is in charge of rendering an HTTP error.         
         *
         * @param {!elenajs.HttpContext} httpContext The http context object.
         * @param {!Object} params Parameters for the render function the  keys are statusCode(required), statusMessage(optional) and message(optional)
         * @returns {undefined}
         */
        render: function (httpContext, params) {
            var self = this,
                res = httpContext.httpResponse,
                req = httpContext.httpRequest,
                renderParams = {};

            renderParams.statusCode = params.statusCode || this.defaultStatusCode;
            renderParams.statusMessage = this._status[renderParams.statusCode];
            renderParams.message = params.message || renderParams.statusMessage;


            this.templateObj.render(renderParams || self).then(
                function (data) {
                    res.writeHead(renderParams.statusCode, {
                        'Content-Type': 'text/html'
                    });
                    res.end(data);
                },
                function (err) {
                    req.httpServer.signal('error', {request: req, response: res, error: err});
                }
            );


        }
    });
    return HttpErrorsRenderer;
});
