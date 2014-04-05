/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "elenajs/dispatchers/RequestDispatcher",
    "elenajs/renderers/TemplateRenderer",
    "elenajs/http/swig!./templates/Page3.html"
], function(
        declare,
        lang,
        RequestDispatcher,
        TemplateRenderer,
        template
        ) {


    return declare('demo/dispatchers/Page3', RequestDispatcher, {
        matcher: /^\/pages\/page3.html$/i,
        title: 'Page 3',
        render: function(req, res, deferredPointer) {
            var self = this;
            var renderer = new TemplateRenderer({
                    httpDeferred: deferredPointer,
                    templateObj: template
                });
            this.processRequest(/*arguments*/req, res, deferredPointer).then(function(data) {
                renderer.render(lang.mixin({}, data, self));
            }, function(err) {
                if (!deferredPointer.isFulfilled()) {
                    deferredPointer.reject(err);
                }
            });
        }
    });
});
