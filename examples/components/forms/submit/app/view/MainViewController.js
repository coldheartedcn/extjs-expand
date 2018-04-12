Ext.define('Submit.view.MainViewController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.myviewport',

    onButtonClick: function(button, e, eOpts) {
        var form = button.up('form');

        form.submit({
            url: 'http://localhost',
            success: function(form, action) {
                Ext.Msg.alert('Success', action);
            },
            failure: function(form, action) {
                Ext.Msg.alert('failure', action);
            }
        });
    }

});