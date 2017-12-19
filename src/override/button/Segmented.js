Ext.override(Ext.button.Segmented, {

    cannotPress: function () {
        return false;
    },

    setReadOnly: function (readOnly) {
        var me = this,
            items = me.items.items;

        if (readOnly === true) {
            Ext.Array.each(items, function (item) {
                item.on('beforetoggle', me.cannotPress)
            });
        } else {
            Ext.Array.each(items, function (item) {
                item.removeListener('beforetoggle', me.cannotPress);
            });
        }
    }

});