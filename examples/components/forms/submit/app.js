// @require @packageOverrides
Ext.Loader.setConfig({

});


Ext.application({
    views: [
        'Main'
    ],
    name: 'Submit',

    launch: function() {
        Ext.create('Submit.view.Main');
    }

});
