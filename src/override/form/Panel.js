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
    }

});
