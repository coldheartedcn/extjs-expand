Ext.override(Ext.data.Store, {

    getJsonData: function () {
        var me = this,
            list = new Array(),
            model = me.getModel(),
            fields = model.getFields();

        fields = Ext.Array.filter(fields, function(field) {
            return field.getPersist();
        });

        me.each(function (record) {
            var //associationsItems = record.associations.items,
                result = new Object();

            for (var x in fields) {
                var mapping = fields[x].mapping,
                    name = fields[x].name;

                if (!Ext.isEmpty(mapping)) {
                    var property = mapping.split('.'),
                        length = property.length;

                    switch (length) {
                        case 1:
                            result[property[0]] = record.get(name);
                            break;
                        case 2:
                            if(result[property[0]] == undefined) {
                                result[property[0]] = new Object();
                            }
                            result[property[0]][property[1]] = record.get(name);
                            break;
                        case 3:
                            if(result[property[0]] == undefined) {
                                result[property[0]] = new Object();
                            }
                            if(result[property[0]][property[1]] == undefined) {
                                result[property[0]][property[1]] = new Object();
                            }
                            result[property[0]][property[1]][property[2]] = record.get(name);
                            break;
                        default:
                            console.error('不允许超过3层对象！');
                    }
                } else {
                    result[name] = record.get(name);
                }
            }

/*            for(var x in associationsItems) {
                var association = associationsItems[x],
                    name = association.name,
                    storeName = association.storeName,
                    type = association.type;

                if (type == 'hasMany') {
                    if (record[storeName] != undefined) {
                        result[name] = record[storeName].getJsonData();
                    }
                }
            }*/

            list.push(result);
        });

        return list;
    }

});
