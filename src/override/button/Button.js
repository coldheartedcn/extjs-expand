Ext.override(Ext.button.Button, {

    v3Permission: null,

    initComponent: function() {
        var me = this;

        if(!Ext.isEmpty(me.v3Permission)) {
            try {
                if(!Ext.Array.contains(g_pl, me.v3Permission)) {
                    me.hidden = true;
                }
            } catch(e) {
                me.hidden = true;
            }
        }

        // WAI-ARIA spec requires that menu buttons react to Space and Enter keys
        // by showing the menu while leaving focus on the button, and to Down Arrow key
        // by showing the menu and selecting first menu item. This behavior may conflict
        // with historical Ext JS menu button behavior if a handler or a click listener
        // is set on a button; in that case Space or Enter key would activate
        // the handler/click listener, and only Down Arrow key would open the menu.
        // To avoid the ambiguity, we check if the button has both menu *and* handler
        // or click event listener, and warn the developer in that case.
        // Note that this check does not apply to Split buttons because those now have
        // two tab stops and can effectively combine both menu and toggling/href/handler.
        //<debug>
        if (!me.isSplitButton && me.menu) {
            if (me.enableToggle || me.toggleGroup) {
                Ext.ariaWarn(me,
                    "According to WAI-ARIA 1.0 Authoring guide " +
                    "(http://www.w3.org/TR/wai-aria-practices/#menubutton), " +
                    "menu button '" + me.id + "' behavior will conflict with " +
                    "toggling."
                );
            }

            if (me.href) {
                Ext.ariaWarn(me,
                    "According to WAI-ARIA 1.0 Authoring guide " +
                    "(http://www.w3.org/TR/wai-aria-practices/#menubutton), " +
                    "menu button '" + me.id + "' cannot behave as a link."
                );
            }

            // Only check listeners of the component instance; there could be other
            // listeners on the EventBus inherited via hasListeners prototype.
            if (me.handler || me.hasListeners.hasOwnProperty('click')) {
                Ext.ariaWarn(me,
                    "According to WAI-ARIA 1.0 Authoring guide " +
                    "(http://www.w3.org/TR/wai-aria-practices/#menubutton), " +
                    "menu button '" + me.id + "' should display the menu " +
                    "on SPACE and ENTER keys, which will conflict with the " +
                    "button handler."
                );
            }
        }
        //</debug>

        // Ensure no selection happens
        me.addCls(Ext.baseCSSPrefix + 'unselectable');

        me.callParent();

        if (me.menu) {
            // Flag that we'll have a splitCls
            me.split = true;
            me.setMenu(me.menu, /*destroyMenu*/false, true);
        }

        // Accept url as a synonym for href
        if (me.url) {
            me.href = me.url;
        }

        // preventDefault defaults to false for links
        me.configuredWithPreventDefault = me.hasOwnProperty('preventDefault');
        if (me.href && !me.configuredWithPreventDefault) {
            me.preventDefault = false;
        }

        if (Ext.isString(me.toggleGroup) && me.toggleGroup !== '') {
            me.enableToggle = true;
        }

        if (me.html && !me.text) {
            me.text = me.html;
            delete me.html;
        }
    }

});
