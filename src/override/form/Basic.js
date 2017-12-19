Ext.override(Ext.form.Basic, {

    getFormatValues: function (allowNull, asString, dirtyOnly, includeEmptyText, userDataValues, isSubmitting) {
        var me = this,
            values = {},
            fields = this.getFields().items,
            fLen = fields.length,
            dataMethod = userDataValues ? 'getModelData' : 'getSubmitData',
            f, field, data, name, val, mappings, count;

        for (f = 0; f < fLen; f++) {
            field = fields[f];

            if (!dirtyOnly || field.isDirty()) {
                data = field[dataMethod](includeEmptyText, isSubmitting);

                if (Ext.isObject(data)) {
                    for (name in data) {
                        if (data.hasOwnProperty(name)) {
                            val = data[name];

                            if (includeEmptyText && val === '') {
                                val = field.emptyText || '';
                            }

                            if (!Ext.isEmpty(val) || allowNull) {
                                mappings = name.split('.');
                                count = mappings.length;

                                switch (count) {
                                    case 1:
                                        me.privateFormatValues(field, values, mappings[0], val);
                                        break;
                                    case 2:
                                        if (!values.hasOwnProperty(mappings[0])) {
                                            values[mappings[0]] = {};
                                        }
                                        me.privateFormatValues(field, values[mappings[0]], mappings[1], val);
                                        break;
                                    case 3:
                                        if (!values.hasOwnProperty(mappings[0])) {
                                            values[mappings[0]] = {};
                                        }
                                        if (!values[mappings[0]].hasOwnProperty(mappings[1])) {
                                            values[mappings[0]][mappings[1]] = {};
                                        }
                                        me.privateFormatValues(field, values[mappings[0]][mappings[1]], mappings[2], val);
                                        break;
                                    default:
                                        console.error('不允许超过3层对象！');
                                }
                            }
                        }
                    }
                }
            }
        }

        if (asString) {
            values = Ext.Object.toQueryString(values);
        }
        return values;
    },

    /**
     * 内部方法，对外无用
     *
     * @param field
     */
    privateFormatValues: function (field, values, name, val) {
        var isArray = Ext.isArray,
            bucket;

        if (!field.isRadio) {
            if (values.hasOwnProperty(name)) {
                bucket = values[name];

                if (!isArray(bucket)) {
                    bucket = values[name] = [bucket];
                }

                if (isArray(val)) {
                    values[name] = bucket.concat(val);
                } else {
                    bucket.push(val);
                }
            } else {
                values[name] = val;
            }
        } else {
            values[name] = values[name] || val;
        }
    },

    setFormatValues: function (values) {
        if (Ext.isEmpty(values)) {
            return false;
        }

        var me = this,
            fields = me.getFields().items,
            objValues = Ext.isArray(values) ? Ext.Array.toObject(values) : values,
            fieldNames, length;

        function setVal(field, val) {
            if (field) {
                if (field.getXType() == 'datefield' && typeof val == 'string') {
                    field.setValue(new Date(val.replace(/-/g, '/')));
                } else {
                    field.setValue(val);
                }
            }
        }

        Ext.suspendLayouts();

        Ext.Array.each(fields, function (field, index, self) {
            try {
                var object, point = 1;
                fieldNames = field.getFormatName();
                length = fieldNames.length;

                if (objValues.hasOwnProperty(fieldNames[0])) {
                    object = objValues[fieldNames[0]];
                }

                while (point < length) {
                    if (object.hasOwnProperty(fieldNames[point])) {
                        object = object[fieldNames[point]];
                        point++;
                    } else {
                        return;
                    }
                }

                if (!Ext.isEmpty(object)) {
                    setVal(field, object);
                }
            } catch (e) {
            }
        });

        Ext.resumeLayouts(true);

        return this;
    },

    validFields: function () {
        var me = this,
            flag = true;

        me.getFields().each(function (field) {
            if (!field.isValid()) {
                Ext.Msg.alert('输入有误', field.activeError);
                flag = false;
                return false;
            }
        });

        return flag;
    },

    /**
     * nameList表示排除哪些field，可以为空
     *
     * @param readOnly
     * @param nameList
     */
    setReadOnly: function (readOnly, nameList) {
        var fields = this.getFields().items;

        if (!Array.isArray(nameList)) {
            if (Ext.isEmpty(nameList)) {
                nameList = [];
            } else {
                console.error('传入参数必须为空或者是Array！');
            }
        }

        if (Array.isArray(fields)) {
            Ext.Array.each(fields, function (field) {
                if (nameList.indexOf(field.getName()) < 0) {
                    field.setReadOnly(readOnly);
                }
            })
        }
    }

});
