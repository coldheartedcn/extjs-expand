Ext.getDoc().on('keydown', function (event, target) {
        if (event.ENTER == event.getKey()) {
            if (!event.shiftKey) {
                var targetEl = Ext.get(target.id);
                var fieldEl = targetEl.up('[class*=x-field]') || {};
                var field = Ext.getCmp(fieldEl.id);
                if (field === undefined) {
                    return;
                }

                var next = null;
                var id = field.getId();
                var fields = field.up('form').getForm().getFields().items;
                for (var i = 0; i < fields.length; i++) {
                    if(fields[i].getId() == id && i != fields.length - 1) {
                        next = fields[i + 1];
                        break;
                    }
                }

                if (next instanceof Ext.form.field.Base) {
                    event.stopEvent();
                    field.fireEvent('blur', field);
                    next.focus();
                    if (next.inputEl && next.inputEl.dom) {
                        next.selectText();
                    }
                }
            } else {
                var targetEl = Ext.get(target.id);
                var fieldEl = targetEl.up('[class*=x-field]') || {};
                var field = Ext.getCmp(fieldEl.id);
                if (field === undefined) {
                    return;
                }
                var next = field.prev('[isFormField]');
                if (next === null) {
                    var container = targetEl.up('[class*=x-container]');
                    if (container != null && container.dom.previousSibling != null) {
                        var nextContainer = Ext.getCmp(container.dom.previousSibling.id);
                        if (nextContainer.xtype == "container") {
                            if (nextContainer.items && nextContainer.items.items instanceof Array) {
                                if (nextContainer.items.items.length > 0) {
                                    next = nextContainer.items.items[nextContainer.items.items.length - 1];
                                }
                            }
                        }
                    }
                }

                if (next instanceof Ext.form.field.Base) {
                    event.stopEvent();
                    field.fireEvent('blur', field);
                    next.focus();
                    if (next.inputEl && next.inputEl.dom) {
                        next.selectText();
                    }
                }
            }
        } else if (event.getKey() == event.BACKSPACE) {
            if (target != null && target.tagName != null && (target.tagName.toLowerCase() == "input" || target.tagName.toLowerCase() == "textarea")) {
                // readOnly
                var fieldEl, fieldCmp;
                fieldEl = Ext.get(target).up('table.x-form-item');
                if (fieldEl && fieldEl.id) {
                    fieldCmp = Ext.getCmp(fieldEl.id);
                }
                if (fieldCmp && (fieldCmp.editable == false || fieldCmp.readOnly == true)) {
                    event.stopEvent();
                }
            } else {
                event.stopEvent();
            }
        }
});