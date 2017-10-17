// @require @packageOverrides
Ext.Loader.setConfig({

});


Ext.application({
    stores: [
        'CheckedTree',
        'NoCheckedTree'
    ],
    views: [
        'Main'
    ],
    name: 'Treecombo',

    launch: function() {
        Ext.create('Treecombo.view.Main');
    }

});
