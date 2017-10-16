Ext.override(Ext.list.AbstractTreeItem, {

    cachedConfig: {
        /**
         * @cfg {Boolean} expandable
         * `true` if this item is expandable. This value is taken from
         * the underlying {@link #node}.
         */
        expandable: false,

        /**
         * @cfg {Boolean} expanded
         * `true` if this item is expanded. This value is taken from
         * the underlying {@link #node}.
         */
        expanded: false,

        /**
         * @cfg {String} iconCls
         * @inheritdoc Ext.panel.Header#cfg-iconCls
         * @localdoc **Note:** This value is taken from the underlying {@link #node}.
         */
        iconCls: '',

        /*
         * 扩展出来的icon，用来显示图片
         */
        icon: '',

        /**
         * @cfg {Boolean} leaf
         * `true` if this item is a leaf. This value is taken from
         * the underlying {@link #node}.
         */
        leaf: true,

        /**
         * @cfg {Boolean} loading
         * `true` if this item is currently loading data. This value is taken from
         * the underlying {@link #node}.
         */
        loading: false,

        /**
         * @cfg {Boolean} selected
         * `true` if this is the selected item in the tree.
         */
        selected: false,

        /**
         * @cfg {Boolean} selectedParent
         * `true` if this item contains the {@link #selected} item in the tree.
         */
        selectedParent: false
    },

    config: {
        /**
         * @cfg {String} iconClsProperty
         * The property from the {@link #node} to map for the {@link #iconCls} config.
         */
        iconClsProperty: 'iconCls',

        /*
         * icon属性
         */
        iconProperty: 'icon',

        indent: null,

        /**
         * @cfg {Ext.list.Tree} owner
         * The owning list for this container.
         */
        owner: null,

        /**
         * @cfg {Ext.data.TreeModel} node
         * The backing node for this item.
         */
        node: null,

        /**
         * @cfg {Number} over
         * One of three possible values:
         *
         *   - 0 if mouse is not over this item or any of its descendants.
         *   - 1 if mouse is not over this item but is over one of this item's descendants.
         *   - 2 if mouse is directly over this item.
         */
        over: null,

        /**
         * @cfg {Ext.list.AbstractTreeItem} parentItem
         * The parent item for this item.
         */
        parentItem: null,

        /**
         * @cfg {String} text
         * The text for this item. This value is taken from
         * the underlying {@link #node}.
         */
        text: {
            lazy: true,
            $value: ''
        },

        /**
         * @cfg {String} textProperty
         * The property from the {@link #node} to map for the {@link #text} config.
         */
        textProperty: 'text'
    },

    privates: {
        /**
         * Update properties after a node update.
         *
         * @param {Ext.data.TreeModel} node The node.
         * @param {String[]} modifiedFieldNames The modified field names, if known.
         *
         * @private
         */
        doNodeUpdate: function (node, modifiedFieldNames) {
            var me = this,
                textProperty = this.getTextProperty(),
                iconProperty = this.getIconProperty(),
                iconClsProperty = this.getIconClsProperty();

            if (textProperty) {
                me.setText(node.data[textProperty]);
            }

            if(iconProperty) {
                me.setIcon(node.data[iconProperty]);
            }

            if (iconClsProperty) {
                me.setIconCls(node.data[iconClsProperty]);
            }

            me.setLoading(node.isLoading());
            me.setLeaf(node.isLeaf());
            me.doUpdateExpandable();
        },

        doUpdateExpandable: function () {
            var node = this.getNode();
            this.setExpandable(node.isExpandable());
        },

        toggleExpanded: function() {
            if (this.isExpanded()) {
                this.collapse();
            } else {
                this.expand();
            }
        },

        updateIndent: function (value) {
            var items = this.itemMap,
                id;

            for (id in items) {
                items[id].setIndent(value);
            }
        },

        /**
         * Implementation so that the Traversable mixin which manipulates the parent
         * axis can function in a TreeList.
         * @param {Ext.list.Tree/Ext.list.TreeItem} owner The owner of this node.
         * @private
         */
        updateOwner: function(owner) {
            this.parent = owner;
        }
    }

});