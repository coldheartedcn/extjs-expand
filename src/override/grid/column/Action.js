Ext.override(Ext.grid.column.Action, {

    initComponent: function() {
        var me = this,
            items = me.items,
            i, len, item;

        for(i = 0, len = items,length; i < len; i++) {
            item = items[i];

            if(!Ext.isEmpty(item.v3Permission)) {
                try {
                    if(!Ext.Array.contains(g_pl, item.v3Permission)) {
                        item.disabled = true;
                    }
                } catch(e) {
                    item.disabled = true;
                }
            }
        }

        me.callParent();
        if (me.sortable && !me.dataIndex) {
            me.sortable = false;
        }
    }

});
