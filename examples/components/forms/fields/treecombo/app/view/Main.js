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
                            xtype: 'treecombo',
                            anchor: '100%',
                            store: 'NoCheckedTree'
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
                            xtype: 'treecombo',
                            anchor: '100%',
                            store: 'CheckedTree',
                            multiSelect: true
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
                                            itemId: 'setValue1',
                                            width: 100,
                                            text: '赋 值'
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
                                            itemId: 'getValue1',
                                            width: 100,
                                            text: '赋 值'
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
                    title: '单选——默认配置',
                    items: [
                        {
                            xtype: 'combobox',
                            anchor: '100%'
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
                                            itemId: 'setValue1',
                                            width: 100,
                                            text: '赋 值'
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
                                            itemId: 'getValue1',
                                            width: 100,
                                            text: '赋 值'
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