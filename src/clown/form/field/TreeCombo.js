Ext.define('Ext.clown.form.field.TreeCombo', {
    extend: 'Ext.form.field.Picker',
    alias: 'widget.treecombo',

    /**
     * @cfg {Boolean} canSelectFolder
     * 是否可以选择目录，默认：false
     */
    canSelectFolders: false,

    /**
     * @cfg {String} displayField
     * 展现的字段，默认：text
     */
    displayField: 'text',

    /**
     * @cfg {Boolean} editable
     * 是否可以编辑内容，默认：false
     */
    editable: false,

    /**
     * @cfg {Number} maxPickerHeight
     * 展现框最大高度，默认：300
     */
    maxPickerHeight: 300,

    /**
     * @cfg {Number} minPickerHeight
     * 展现框最小高度，默认：200
     */
    minPickerHeight: 200,

    /**
     * @cfg {Boolean} multiSelect
     * 是否多选标记，默认：false(单选)
     */
    multiSelect: false,

    /**
     * @cfg {Array} records
     * 选择model集
     */
    records: [],

    /**
     * @cfg {Array} recursiveRecords
     * 过程中递归model集
     */
    recursiveRecords: [],

    /**
     * @cfg {Boolean} selectChildren
     * 是否选择子节点，配合多选使用，默认：true
     */
    selectChildren: true,

    /**
     * @cfg {Ext.data.TreeStore} store
     * 树型store配置，用于提供数据
     */
    store: null,

    /**
     * @cfg {String} valueField
     * 提交的字段，默认：id
     */
    valueField: 'id',

    /**
     * @event itemclick
     * Keypress input field event. This event only fires if **{@link #enableKeyEvents}** is set to true.
     * @param {Ext.tree.Panel} view 展开的树型panel
     * @param {Ext.data.Model} record click的item内容
     * @param {HTMLElement} item 节点内容
     * @param {Number} index 节点的序号
     * @param {Array} records 所有选中的model
     * @param {Array} values 所有选中的model的id集
     * @param {Ext.event.Event} e
     * @param {Object} eOpts
     */

    //TODO 判断父节点
    /**
     * @private
     *
     * @param node
     */
    checkParentNodes: function (node) {
        if (node == null) {
            return;
        }

        var me = this,
            checkedAll = true,
            ids = [];

        Ext.each(me.records, function (record) {
            ids.push(record.get(me.valueField));
        });

        node.eachChild(function (child) {
            if (!Ext.Array.contains(ids, child.get(me.valueField))) {
                checkedAll = false;
            }
        });

        if (checkedAll === true) {
            me.records.push(node);
            me.checkParentNodes(node.parentNode);
        } else {
            Ext.Array.remove(me.records, node);
            me.checkParentNodes(node.parentNode);
        }
    },

    /**
     * @private
     * 创建并返回treePanel，用来展开时显示
     * @returns {Ext.tree.Panel}
     */
    createPicker: function () {
        var me = this,
            picker,
            store = me.store || new Ext.data.TreeStore({
                root: {
                    expanded: true
                },

                proxy: {
                    type: 'ajax',
                    url: me.url,
                    reader: {
                        type: 'json',
                        rootProperty: 'returnObject'
                    }
                }
            }),
            bufferTime = (me.multiSelect === false && me.canSelectFolders === false) ? 300 : 0,
            pickerCfg = Ext.apply({
                xtype: 'treepanel',
                id: me.id + '-picker',
                floating: true,
                hidden: true,
                maxHeight: me.maxPickerHeight,
                minHeight: me.minPickerHeight,
                minWidth: 100,
                useArrows: true,
                store: store,
                shadow: 'sides',
                viewConfig: {
                    toggleOnDblClick: false
                },
                renderTo: Ext.getBody(),
                listeners: {
                    scope: me,
                    itemclick: {
                        fn: me.onItemClick,
                        buffer: bufferTime
                    },
                    // 关闭check框的事件
                    beforecheckchange: function () {
                        return false;
                    }
                }
            });

        picker = me.picker = Ext.widget(pickerCfg);

        return picker;
    },

    /**
     * @private
     * 添加itemclick事件
     * @param config
     */
    /*constructor: function(config) {
        this.addEvents({
            "itemclick": true
        });

        this.listeners = config.listeners;
        this.callParent(arguments);
    },*/

    /**
     * @private
     * 当被选中时进行触发
     */
    initComponent: function () {
        var me = this;

        me.callParent(arguments);
    },

    getSubmitValue: function () {
        return this.value;
    },

    getSubTplData: function (fieldData) {
        var me = this,
            data, ariaAttr;

        data = me.callParent([fieldData]);

        if (!me.ariaStaticRoles[me.ariaRole]) {
            ariaAttr = data.ariaElAttributes;

            if (ariaAttr) {
                ariaAttr['aria-owns'] = me.id + '-inputEl ' + me.id + '-picker-eventEl';
                ariaAttr['aria-autocomplete'] = 'none';
            }
        }

        return data;
    },

    getValue: function () {
        return this.value;
    },

    /**
     * @private
     * 触发item的click事件
     * @param {Ext.tree.View} view
     * @param {Ext.data.Model} record
     * @param {HTMLElement} node
     * @param {Number} rowIndex
     * @param {Ext.event.Event} e
     * @param {Object} eOpts
     */
    onItemClick: function (view, record, item, index, e, eOpts) {
        var me = this,
            treePanel = me.getPicker(),
            values = [];

        // 多选
        if (me.multiSelect === true) {
            var checked = record.get('checked'),
                values = [];

            if (record.get('leaf') === true || me.selectChildren === false) {
                if (checked === true) {
                    Ext.Array.remove(me.records, record);
                } else {
                    me.records.push(record);
                }
            } else {
                me.recursiveRecords = [];

                if (checked === false) {
                    // 遍历放入recursiveRecords中
                    me.recursivePush(record);

                    // 如果遍历结果里面有model不在records中，就push到records中
                    Ext.each(me.recursiveRecords, function (value) {
                        if (!Ext.Array.contains(me.records, value)) {
                            me.records.push(value);
                        }
                    });
                } else {
                    // 遍历从records中remove掉
                    me.recursiveRemove(record);
                }
            }
        } else { //单选
            // 目录可选或者是叶子，直接赋值
            if (record.get('leaf') === true || me.canSelectFolders === true) {
                me.records = [];

                me.records.push(record);
            } else { // 目录不可选且为目录，进行展开和合拢操作
                treePanel.suspendEvent('itemclick');

                if (record.isExpanded() === true) {
                    record.collapse();
                } else {
                    record.expand();
                }

                treePanel.resumeEvent('itemclick');
                return;
            }
        }

        Ext.each(me.records, function (record) {
            values.push(record.get(me.valueField));
        });

        me.setValue(values.join(','));

        // 触发开发人员写的itemclick事件
        me.fireEvent('itemclick', me, record, item, index, me.records, values, e, eOpts);

        if (me.multiSelect === false) {
            me.collapse();
        }
    },

    onLoad: function () {
        if (me.afterLoadSetValue != false) {
            me.setValue(me.afterLoadSetValue);
        }
    },

    /**
     * @private
     * 遍历node下面所有节点，并push进recursiveRecords中
     * @param node
     */
    recursivePush: function (node) {
        var me = this;

        me.recursiveRecords.push(node);

        node.eachChild(function (child) {
            if (child.hasChildNodes() === true) {
                me.recursivePush(child);
            } else {
                me.recursiveRecords.push(child);
            }
        });
    },

    /**
     * @private
     * 遍历node下面所有节点，并从records中remove掉
     * @param node
     */
    recursiveRemove: function (node) {
        var me = this;

        Ext.Array.remove(me.records, node);

        node.eachChild(function (child) {
            if (child.hasChildNodes() === true) {
                me.recursiveRemove(child);
            } else {
                Ext.Array.remove(me.records, child);
            }
        });
    },

    /**
     * @private
     * 设值
     * @param valueInit
     */
    setValue: function (valueInit) {
        if (typeof valueInit === 'undefined') {
            return;
        }

        var me = this,
            treePanel = me.getPicker(),
            root = treePanel.getRootNode(),
            values = valueInit.split(','),
            selects = [];

        if (treePanel.store.isLoaded() === false) {
            me.afterLoadSetValue = valueInit;
        }

        // 初始化records，如此直接setValue赋值就不会和itemclick发生难以预料的数据异常
        me.records = [];
        if (me.multiSelect === true) {
            me.traversalNode(root, values, selects);

            me.setRawValue(selects.join(', '))
        } else {
            var record = root.findChild(me.valueField, valueInit, true);

            if (record === null) {
                Ext.Msg.alert('错误提醒', '没有值[' + valueInit + ']对应的选项');
                return false;
            } else if (me.canSelectFolders === false && record.get('leaf') === false) {
                Ext.Msg.alert('错误提醒', '值[' + valueInit + ']对应的选项[' + record.get(me.displayField) + ']为目录');
                return false;
            } else {
                me.records.push(record);
                me.setRawValue(record.get(me.displayField));
            }
        }

        me.value = valueInit;
        me.checkChange();

        return me;
    },

    traversalNode: function (node, values, selects) {
        var me = this;

        node.eachChild(function (child) {
            if (Ext.Array.contains(values, child.get(me.valueField)) === true) {
                child.set('checked', true);

                selects.push(child.get(me.displayField));
                me.records.push(child);
            } else {
                child.set('checked', false);
            }

            if (child.hasChildNodes() === true) {
                me.traversalNode(child, values, selects);
            }
        });
    }
});