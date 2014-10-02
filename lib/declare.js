define([
    "dcl/dcl",
    "dojo/_base/lang"
], function (dcl, lang) {
    //dcl wrapper. dcl should be somewhat considered a private dependency.
    var declare = function (declaredClass, baseClass, props, definedProperites) {
        if (typeof declaredClass !== 'string') {
            definedProperites = props;
            props = baseClass;
            baseClass = declaredClass;
            declaredClass = null;
        } else {
            props.declaredClass = declaredClass;
        }
        
        var result = dcl(baseClass, props);
        if (definedProperites) {
            Object.defineProperties(result.prototype, definedProperites);
        }
        
        return result;
    };
    lang.mixin(declare, dcl);
    return declare;
});