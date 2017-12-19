Ext.override(Ext.form.Panel, {

    getFormatValues: function (allowNull, asString, dirtyOnly, includeEmptyText, userDataValues, isSubmitting) {
        return this.getForm().getFormatValues(allowNull, asString, dirtyOnly, includeEmptyText, userDataValues, isSubmitting);
    },

    loadFormatRecord: function (record) {
        return this.setFormatValues(record.getData());
    },

    setFormatValues: function (values) {
        return this.getForm().setFormatValues(values);
    },

    validFields: function () {
        var me = this;

        return me.getForm().validFields();
    },

    setReadOnly: function(readOnly, nameList) {
        var me = this;

        // 操作field
        me.getForm().setReadOnly(readOnly, nameList);

        // 遍历fieldcontainer和segmentedbutton
        me.iterateSetReadOnly(readOnly, me);
    },

    iterateSetReadOnly: function(readOnly, component) {
        var me = this,
            child = component.child();

        while(!Ext.isEmpty(child)) {
            if(child.isXType('container')) {
                if(child.isXType('fieldcontainer') || child.isXType('segmentedbutton')) {
                    child.setReadOnly(readOnly);
                }

                if(!child.isXType('segmentedbutton')) {
                    me.iterateSetReadOnly(readOnly, child);
                }

            }

            child = child.next();
        }
    }

});
