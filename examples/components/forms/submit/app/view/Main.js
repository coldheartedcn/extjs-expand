Ext.define('Submit.view.Main', {
    extend: 'Ext.container.Viewport',
    alias: 'widget.myviewport',

    requires: [
        'Submit.view.MainViewController',
        'Ext.form.Panel',
        'Ext.form.field.Text'
    ],

    controller: 'myviewport',
    layout: 'fit',

    items: [
        {
            xtype: 'form',
            bodyPadding: 10,
            title: 'My Form',
            items: [
                {
                    xtype: 'textfield',
                    anchor: '100%',
                    fieldLabel: 'Label',
                    name: 'labelA'
                },
                {
                    xtype: 'textfield',
                    anchor: '100%',
                    fieldLabel: 'Label',
                    name: 'labelB'
                },
                {
                    xtype: 'textfield',
                    anchor: '100%',
                    fieldLabel: 'Label',
                    name: 'labelC'
                },
                {
                    xtype: 'button',
                    text: 'MyButton',
                    listeners: {
                        click: 'onButtonClick'
                    }
                }
            ]
        }
    ]

});