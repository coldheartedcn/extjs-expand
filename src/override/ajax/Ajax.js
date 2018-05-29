var _v3SessionTimeOutException = false;
/**
 * 重写proxy.Ajax类，解决session超时
 */
Ext.override(Ext.data.proxy.Ajax, {
    afterRequest:function(request, success){
        if (success === false && _v3SessionTimeOutException === false)	{
            _v3SessionTimeOutException = true;

            Ext.Msg.confirm('提示','当前登录会话已过期,请重新刷新页面?',function(btn){
                if('yes' == btn){
                    window.location.reload();
                }else{
                    _v3SessionTimeOutException = false;
                }
            });

        }else if(success === true){
            _v3SessionTimeOutException = false;
        }
    }
});