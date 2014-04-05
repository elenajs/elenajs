/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define([
    "dojo/_base/declare",
    "elenajs/dispatchers/RequestDispatcher",
    "elenajs/renderers/TemplateRenderer",
    "elenajs/http/swig!./templates/Page2.html"
], function(
        declare,
        RequestDispatcher,
        TemplateRenderer,
        template
        ) {


    return declare('demo/dispatchers/Page2', RequestDispatcher, {
        matcher: /^\/pages\/page2.html$/i,
        title: 'Page 2',
        render: function(deferredPointer) {
            var self = this;
            new TemplateRenderer({
                httpDeferred: deferredPointer,
                templateObj: template
            }).render(self);
        }
    });
});
