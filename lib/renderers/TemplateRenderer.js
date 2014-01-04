define([
    "dojo/_base/declare",
    "./Renderer",
    "../_ErrorRendererMixin"
], function(declare,
        Renderer,
        _ErrorRendererMixin
        ) {

    var TemplateRenderer = declare("elenajs.renderers.TemplateRenderer", [Renderer,_ErrorRendererMixin], {
        mimetype: "text/html",
        renderObj: null,
        render: function(params) {
            var self = this,
                    req = this.request;
            this.renderTemplate(params);
        },
        renderTemplate: function(params) {

            var self = this,
                    res = this.response,
                    req = this.request;
            if (this.templateObj) {

                this.templateObj.render(params || this).then(
                    function(data) {
                        res.writeHead(res.statusCode, {
                            'Content-Type': self.mimetype
                        });
                        res.end(data);
                    },
                    function(err) {
                        self.handleError(self.deferred, self.request, self.response, 500, err);
                    }
                 );
            } else {
                self.handleError(self.deferred, self.request, self.response, 500, new TypeError("No template defined"));
            }


        }
    });
    return TemplateRenderer;
});
