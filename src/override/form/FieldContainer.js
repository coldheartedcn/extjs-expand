Ext.override(Ext.form.FieldContainer, {

    labelReadOnlyCls: 'clown-form-item-label-readonly',

    setReadOnly: function (readOnly) {
        var me = this,
            labelEl = me.labelEl;

        if (labelEl) {
            labelEl[readOnly ? 'addCls' : 'removeCls'](me.labelReadOnlyCls);
        }
    }

});