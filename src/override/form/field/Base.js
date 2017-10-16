Ext.override(Ext.form.field.Base, {

    getFormatName: function() {
        var me = this,
            fullName = me.name || me.id;

        if(!Ext.isEmpty(fullName)) {
            return fullName.split('.');
        }

        return null;
    }

});
