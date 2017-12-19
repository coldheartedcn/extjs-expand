Ext.override(Ext.form.field.Base, {

    labelReadOnlyCls: 'clown-form-item-label-readonly',

    getFormatName: function () {
        var me = this,
            fullName = me.name || me.id;

        if (!Ext.isEmpty(fullName)) {
            return fullName.split('.');
        }

        return null;
    },

    setReadOnly: function (readOnly) {
        var me = this,
            labelEl = me.labelEl,
            inputEl = me.inputEl,
            old = me.readOnly,
            mark, valid;

        readOnly = !!readOnly;
        me[readOnly ? 'addCls' : 'removeCls'](me.readOnlyCls);
        me.readOnly = readOnly;

        if (inputEl) {
            inputEl.dom.readOnly = readOnly;
            inputEl.dom.setAttribute('aria-readonly', readOnly);
        } else if (me.rendering) {
            me.setReadOnlyOnBoxReady = true;
        }

        // 处理label的样式
        if (labelEl) {
            labelEl[readOnly ? 'addCls' : 'removeCls'](me.labelReadOnlyCls);
        }

        if (readOnly !== old) {
            me.fireEvent('writeablechange', me, readOnly);
        }

        // 处理验证
        if(readOnly) {
            if (me.hasActiveError()) {
                me.clearInvalid();
                me.hadErrorOnDisable = true;
            }

            if (me.wasValid === false) {
                me.checkValidityChange(true);
            }
        } else {
            mark = me.preventMark;

            if (me.wasValid !== undefined) {
                me.forceValidation = true;
                me.preventMark = !me.hadErrorOnDisable;
                valid = me.isValid();
                me.forceValidation = false;
                me.preventMark = mark;
                me.checkValidityChange(valid);
            }
        }
    }

});
