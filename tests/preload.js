define({
    load: function (id, require, callback) {
        require([ 'dojo/has' ], function (has) {
            has.add('host-node', true);
            require(id.split(/\s*,\s*/), callback);
        });
    }
});