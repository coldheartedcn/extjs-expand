Ext.define('Treecombo.view.Main', {
    extend: 'Ext.container.Viewport',
    alias: 'widget.main',

    requires: [
        'Treecombo.view.MainViewController',
        'Ext.form.Panel',
        'Ext.form.FieldSet',
        'Ext.clown.form.field.TreeCombo',
        'Ext.button.Button'
    ],

    controller: 'main',
    height: 250,
    width: 400,
    layout: 'fit',

    items: [
        {
            xtype: 'form',
            bodyPadding: 10,
            title: 'treecombo的演示',
            titleAlign: 'center',
            items: [
                {
                    xtype: 'fieldset',
                    title: '单选——默认配置',
                    items: [
                        {
                            xtype: 'displayfield',
                            anchor: '100%',
                            value: '<font color=red>可以添加itemclick事件</font>'
                        },
                        {
                            xtype: 'treecombo',
                            anchor: '100%',
                            store: 'NoCheckedTree',
                            listeners: {
                                itemclick: function(view, record, item, index, records, values, e, eOpts) {
                                    console.log(records.length);
                                }
                            },
                        },
                        {
                            xtype: 'container',
                            layout: {
                                type: 'hbox',
                                align: 'stretch',
                                pack: 'center'
                            },
                            items: [
                                {
                                    xtype: 'container',
                                    flex: 1
                                },
                                {
                                    xtype: 'textfield',
                                    flex: 2,
                                    fieldLabel: '填 值',
                                    labelWidth: 80
                                },
                                {
                                    xtype: 'container',
                                    flex: 1,
                                    layout: {
                                        type: 'hbox',
                                        align: 'stretch',
                                        pack: 'center'
                                    },
                                    items: [
                                        {
                                            xtype: 'button',
                                            width: 100,
                                            text: '赋 值',
                                            listeners: {
                                                click: 'onSetValueClick'
                                            }
                                        }
                                    ]
                                },
                                {
                                    xtype: 'container',
                                    flex: 1,
                                    layout: {
                                        type: 'hbox',
                                        align: 'stretch',
                                        pack: 'center'
                                    },
                                    items: [
                                        {
                                            xtype: 'button',
                                            width: 100,
                                            text: '获 取 值',
                                            listeners: {
                                                click: 'onGetValueClick'
                                            }
                                        }
                                    ]
                                },
                                {
                                    xtype: 'container',
                                    flex: 1
                                }
                            ]
                        }
                    ]
                },
                {
                    xtype: 'fieldset',
                    title: '单选——选择目录',
                    items: [
                        {
                            xtype: 'treecombo',
                            anchor: '100%',
                            store: 'NoCheckedTree',
                            canSelectFolders: true
                        },
                        {
                            xtype: 'container',
                            layout: {
                                type: 'hbox',
                                align: 'stretch',
                                pack: 'center'
                            },
                            items: [
                                {
                                    xtype: 'container',
                                    flex: 1
                                },
                                {
                                    xtype: 'textfield',
                                    flex: 2,
                                    fieldLabel: '填 值',
                                    labelWidth: 80
                                },
                                {
                                    xtype: 'container',
                                    flex: 1,
                                    layout: {
                                        type: 'hbox',
                                        align: 'stretch',
                                        pack: 'center'
                                    },
                                    items: [
                                        {
                                            xtype: 'button',
                                            width: 100,
                                            text: '赋 值',
                                            listeners: {
                                                click: 'onSetValueClick'
                                            }
                                        }
                                    ]
                                },
                                {
                                    xtype: 'container',
                                    flex: 1,
                                    layout: {
                                        type: 'hbox',
                                        align: 'stretch',
                                        pack: 'center'
                                    },
                                    items: [
                                        {
                                            xtype: 'button',
                                            width: 100,
                                            text: '获 取 值',
                                            listeners: {
                                                click: 'onGetValueClick'
                                            }
                                        }
                                    ]
                                },
                                {
                                    xtype: 'container',
                                    flex: 1
                                }
                            ]
                        }
                    ]
                },
                {
                    xtype: 'fieldset',
                    title: '多选——默认配置',
                    items: [
                        {
                            xtype: 'displayfield',
                            anchor: '100%',
                            value: '<font color=red>注意：setValue是不会触发联动效应</font>'
                        },
                        {
                            xtype: 'treecombo',
                            anchor: '100%',
                            store: 'CheckedTree',
                            multiSelect: true,
                            emptyText: '所有分类'
                        },
                        {
                            xtype: 'container',
                            layout: {
                                type: 'hbox',
                                align: 'stretch',
                                pack: 'center'
                            },
                            items: [
                                {
                                    xtype: 'container',
                                    flex: 1
                                },
                                {
                                    xtype: 'textfield',
                                    flex: 2,
                                    fieldLabel: '填 值',
                                    labelWidth: 80
                                },
                                {
                                    xtype: 'container',
                                    flex: 1,
                                    layout: {
                                        type: 'hbox',
                                        align: 'stretch',
                                        pack: 'center'
                                    },
                                    items: [
                                        {
                                            xtype: 'button',
                                            width: 100,
                                            text: '赋 值',
                                            listeners: {
                                                click: 'onSetValueClick'
                                            }
                                        }
                                    ]
                                },
                                {
                                    xtype: 'container',
                                    flex: 1,
                                    layout: {
                                        type: 'hbox',
                                        align: 'stretch',
                                        pack: 'center'
                                    },
                                    items: [
                                        {
                                            xtype: 'button',
                                            width: 100,
                                            text: '获 取 值',
                                            listeners: {
                                                click: 'onGetValueClick'
                                            }
                                        }
                                    ]
                                },
                                {
                                    xtype: 'container',
                                    flex: 1
                                }
                            ]
                        }
                    ]
                },
                {
                    xtype: 'fieldset',
                    title: '多选——只选节点不联动',
                    items: [
                        {
                            xtype: 'treecombo',
                            anchor: '100%',
                            store: 'CheckedTree',
                            multiSelect: true,
                            selectOnly: true
                        },
                        {
                            xtype: 'container',
                            layout: {
                                type: 'hbox',
                                align: 'stretch',
                                pack: 'center'
                            },
                            items: [
                                {
                                    xtype: 'container',
                                    flex: 1
                                },
                                {
                                    xtype: 'textfield',
                                    flex: 2,
                                    fieldLabel: '填 值',
                                    labelWidth: 80
                                },
                                {
                                    xtype: 'container',
                                    flex: 1,
                                    layout: {
                                        type: 'hbox',
                                        align: 'stretch',
                                        pack: 'center'
                                    },
                                    items: [
                                        {
                                            xtype: 'button',
                                            width: 100,
                                            text: '赋 值',
                                            listeners: {
                                                click: 'onSetValueClick'
                                            }
                                        }
                                    ]
                                },
                                {
                                    xtype: 'container',
                                    flex: 1,
                                    layout: {
                                        type: 'hbox',
                                        align: 'stretch',
                                        pack: 'center'
                                    },
                                    items: [
                                        {
                                            xtype: 'button',
                                            width: 100,
                                            text: '获 取 值',
                                            listeners: {
                                                click: 'onGetValueClick'
                                            }
                                        }
                                    ]
                                },
                                {
                                    xtype: 'container',
                                    flex: 1
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]

});