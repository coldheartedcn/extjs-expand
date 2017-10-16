Ext.override(Ext.Array, {

    /**
     * array格式：[[id: 1, value: 1], [id:2, value:2], ...]
     * id可以用点号分子对象，但是不能超过三层
     *
     * @param array
     */
    toObject: function (array) {
        var count = array.length,
            object, ids, length, result = {};

        for (var i = 0; i < count; i++) {
            object = array[i];
            ids = object.id.split('.');
            length = ids.length;

            switch (length) {
                case 1:
                    result[ids[0]] = object.value;
                    break;
                case 2:
                    if(result[ids[0]] == undefined) {
                        result[ids[0]] = new Object();
                    }
                    result[ids[0]][ids[1]] = object.value;
                    break;
                case 3:
                    if(result[ids[0]] == undefined) {
                        result[ids[0]] = new Object();
                    }
                    if(result[ids[0]][ids[1]] == undefined) {
                        result[ids[0]][ids[1]] = new Object();
                    }
                    result[ids[0]][ids[1]][ids[2]] = object.value;
                    break;
                default:
                    console.error('不允许超过3层对象！');
            }

        }

        return result;
    }

});
