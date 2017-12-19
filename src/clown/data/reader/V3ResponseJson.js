Ext.define('Ext.clown.data.reader.V3ResponseJson', {
    extend: 'Ext.data.reader.Json',
    alias: 'reader.v3responsejson',

    extractData: function (root, readOptions) {
        var status = root.result,
            title, message;

        if (status === 'SUCCESS') {
            return this.callParent([root.returnObject, readOptions]);
        } else if (status === 'PENDING') {
            title = '提醒';
            message = '提交成功，进入执行队列，ID为[' + root.returnObject + ']';
        } else {
            title = '警告';
            message = root.returnObject;
        }

        Ext.Msg.show({
            title: title,
            icon: Ext.Msg.WARNING,
            msg: message,
            buttons: Ext.Msg.OK
        });
        return [];
    }
});
