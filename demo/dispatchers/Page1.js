/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define([
    "dojo/_base/declare",
    "elenajs/dispatchers/RequestDispatcher",
    "elenajs/renderers/TemplateRenderer",
    "elenajs/http/swig!./templates/Page1.html"
], function(
        declare,
        RequestDispatcher,
        TemplateRenderer,
        template
        ) {


    return declare('demo/dispatchers/Page1', RequestDispatcher, {
        matcher: /^\/pages\/page1.html$/i,
        title: 'Page 1',
        render: function(req, res, deferredPointer) {
            var self = this;
            new TemplateRenderer({
                request: req,
                response: res,
                deferred: deferredPointer,
                templateObj: template
            }).render(self);
        }
    });
});
