Ext.override(Ext.grid.column.Action, {

    constructor: function(config) {
        var me = this,
            cfg = Ext.apply({}, config),
            // Items may be defined on the prototype
            items = cfg.items || me.items || [me],
            hasGetClass,
            i, len, item;

        me.origRenderer = cfg.renderer || me.renderer;
        me.origScope = cfg.scope || me.scope;

        me.renderer = me.scope = cfg.renderer = cfg.scope = null;

        // This is a Container. Delete the items config to be reinstated after construction.
        cfg.items = null;
        me.callParent([cfg]);

        if (me.hasOwnProperty('isDisabled')) {
            //<debug>
            Ext.log.warn('[Ext.grid.column.Action] The isDisabled config is deprecated. ' +
                'Use isActionDisabled to avoid conflict with Ext.Component#isDisabled().');
            //</debug>

            me.isActionDisabled = me.isDisabled;
            delete me.isDisabled;
        }

        // Items is an array property of ActionColumns
        me.items = items;

        for (i = 0, len = items.length; i < len; ++i) {
            item = items[i];
            if (item.substr && item[0] === '@') {
                item = me.getAction(item.substr(1));
            }

            // 进行权限校验
            if(!Ext.isEmpty(item.v3Permission)) {
                try {
                    if(!Ext.Array.contains(g_pl, item.v3Permission)) {
                        Ext.Array.remove(me.items, item);
                        len--;
                        i--;
                        continue;
                    }
                } catch(e) {
                    Ext.Array.remove(me.items, item);
                    len--;
                    i--;
                    continue;
                }
            }

            if (item.hasOwnProperty('isDisabled')) {
                //<debug>
                Ext.log.warn('[Ext.grid.column.Action] The isDisabled config is deprecated. ' +
                    'Use isActionDisabled to avoid conflict with Ext.Component#isDisabled().');
                //</debug>

                item.isActionDisabled = item.isDisabled;
                delete item.isDisabled;
            }

            if (item.isAction) {
                items[i] = item.initialConfig;

                // Register an ActinoProxy as a Component with the Action.
                // Action methods will be relayed down into the targeted item set.
                item.addComponent(new Ext.grid.column.ActionProxy(me, items[i], i));
            }
            if (item.getClass) {
                hasGetClass = true;
            }
        }

        // 依据items的数量，去改变宽度，甚至隐藏
        if(me.items.length === 0) {
            me.setVisible(false);
        } else {
            me.setMaxWidth(8 + 30 * me.items.length);
            me.setMinWidth(8 + 30 * me.items.length);
        }

        // Also need to check for getClass, since it changes how the cell renders
        if (me.origRenderer || hasGetClass) {
            me.hasCustomRenderer = true;
        }
    },

});
