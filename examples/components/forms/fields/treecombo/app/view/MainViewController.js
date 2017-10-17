Ext.define('Treecombo.view.MainViewController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.main',

    onSetValueClick: function (button, e, eOpts) {
        var field = button.up('container').up('container').down('textfield'),
            value = field.getValue(),
            treecombo = button.up('fieldset').down('treecombo');

        treecombo.setValue(value);
    },

    onGetValueClick: function (button, e, eOpts) {
        var fieldset = button.up('fieldset'),
            treecombo = fieldset.down('treecombo');

        Ext.Msg.alert(fieldset.title, '选中的值为[' + treecombo.getValue() + ']');
    }

});
