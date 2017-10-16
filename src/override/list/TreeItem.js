Ext.override(Ext.list.TreeItem, {

    element: {
        reference: 'element',
        tag: 'li',
        cls: Ext.baseCSSPrefix + 'treelist-item',

        children: [{
            reference: 'rowElement',
            cls: Ext.baseCSSPrefix + 'treelist-row',

            children: [{
                reference: 'wrapElement',
                cls: Ext.baseCSSPrefix + 'treelist-item-wrap',
                children: [{
                    reference: 'iconElement',
                    cls: Ext.baseCSSPrefix + 'treelist-item-icon',
                    children: [{
                        reference: 'iconImage',
                        tag: 'img',
                        cls: Ext.baseCSSPrefix + 'treelist-item-icon-img'
                    }]
                }, {
                    reference: 'textElement',
                    cls: Ext.baseCSSPrefix + 'treelist-item-text'
                }, {
                    reference: 'expanderElement',
                    cls: Ext.baseCSSPrefix + 'treelist-item-expander'
                }]
            }]
        }, {
            reference: 'itemContainer',
            tag: 'ul',
            cls: Ext.baseCSSPrefix + 'treelist-container'
        }, {
            reference: 'toolElement',
            cls: Ext.baseCSSPrefix + 'treelist-item-tool',
            children: [{
                reference: 'toolImage',
                tag: 'img',
                cls: Ext.baseCSSPrefix + 'treelist-item-tool-img'
            }]
        }]
    },

    updateIcon: function (icon, oldIcon) {
        var me = this,
            el = me.element;

        me.iconImage.dom.setAttribute('src', icon);
        me.toolImage.dom.setAttribute('src', icon);
    },

    updateIconCls: function (iconCls, oldIconCls) {
        var me = this,
            el = me.element;

        me.doIconCls(me.iconElement, iconCls, oldIconCls);
        me.doIconCls(me.toolElement, iconCls, oldIconCls);

        el.toggleCls(me.withIconCls, !!iconCls);
        // Blank iconCls leaves room for icon to line up w/sibling items
        el.toggleCls(me.hideIconCls, iconCls === null);
    }

});
