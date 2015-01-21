define([
    "dcl/dcl",
    "dojo/_base/lang"
], function (dcl, lang) {
    //dcl wrapper. dcl should be somewhat considered a private dependency.
    var declare = function (declaredClass, baseClass, props, definedProperties) {
        if (typeof declaredClass !== 'string') {
            definedProperties = props;
            props = baseClass;
            baseClass = declaredClass;
            declaredClass = null;
        } else {
            props.declaredClass = declaredClass;
        }
        
        var result = dcl(baseClass, props);
        if (definedProperties) {
            Object.defineProperties(result.prototype, definedProperties);
        }
        
        return result;
    };
    lang.mixin(declare, dcl);
    return declare;
});