if (!g_v3) {
    g_v3 = {};
}

/**
 * 支持 pending 异步相应的ajax调用,json格式数据传输
 *
 * params： option option.form
 * 提交的form，会调用form.submit提交代码，v3后台已经修改了相关代码，如果是form提交，返回类型是rsreponse的，会改为json格式返回
 * option.method POST\GET option.scope option.url option.waitMsg 等待执行的提示信息
 *
 * sucessFn function(rsResponse, opts){ //rsResponse 就算 java端的RSResponse
 *  }
 *
 * exceptionFn function(rsResponse, opts){ //rsResponse 就算 java端的RSResponse
 *  }
 */
g_v3.form = function(option) {

    option.method = option.method || 'POST';
    option.waitMsg = option.waitMsg || '正在执行，请稍等....';

    var myMask = new Ext.LoadMask({
        msg    : option.waitMsg,
        target : option.view,
        msgCls : 'z-index:10000;'
    });
    myMask.show();

    option.form.submit({
        url : option.url,
        method : option.method,
        clientValidation : false,
        //waitMsg:option.waitMsg,
        success : function(f, o) {
            var rsResponse = Ext.decode(o.response.responseText);

            if (rsResponse.result === 'SUCCESS') {
                myMask.hide();
                delete myMask;
                if (option.success !== undefined) {
                    option.success.apply(option.scope, [ rsResponse, opts ]);
                } else {
                    Ext.Msg.alert('提示', '执行成功');
                }
                delete option;

            } else if ("PENDING" === rsResponse.result) {
                var jobId = rsResponse.returnObject;
                var flag = true;
                var poll = setInterval(function() {
                    if (flag) {
                        Ext.Ajax.request({
                            url : g_v3.webcontext
                            + '/service/asyncResult?jobId=' + jobId,
                            headers : {
                                accept : 'application/json'
                            },
                            method : 'GET',
                            // scope: _this,
                            success : function(response, opts) {
                                var rsResponse = Ext
                                    .decode(response.responseText);

                                if (rsResponse.result === 'SUCCESS') {
                                    flag = false;
                                    clearInterval(poll);
                                    myMask.hide();
                                    delete myMask;
                                    clearInterval(poll);
                                    if (option.success !== undefined) {
                                        option.success.apply(option.scope, [
                                            rsResponse, opts ]);
                                    } else {
                                        Ext.Msg.alert('提示', '执行成功');
                                    }
                                    delete option;

                                } else if ('EXCEPTION' === rsResponse.result) {
                                    flag = false;
                                    myMask.hide();
                                    delete myMask;
                                    clearInterval(poll);
                                    if (option.exception !== undefined) {
                                        option.exception.apply(option.scope, [
                                            rsResponse, opts ]);
                                    } else {

                                        Ext.Msg.show({
                                            title : '错误',
                                            icon : Ext.Msg.WARNING,
                                            msg : '发生错误：'
                                            + rsResponse.returnObject,
                                            buttons : Ext.Msg.OK
                                        });
                                    }

                                    delete option;
                                }
                            },
                            failure : function(response, opts) {
                                flag = false;
                                myMask.hide();
                                delete myMask;
                                delete option;
                                clearInterval(poll);
                                Ext.Msg.show({
                                    title : '错误',
                                    icon : Ext.Msg.WARNING,
                                    msg : '发生错误：' + response.status + ","
                                    + response.statusText,
                                    buttons : Ext.Msg.OK
                                });
                            }
                        });
                    } else {
                        clearInterval(poll);
                    }
                }, 5000);

            } else {
                myMask.hide();
                delete myMask;
                delete option;
                Ext.Msg.show({
                    title : '错误',
                    icon : Ext.Msg.WARNING,
                    msg : rsResponse.returnObject,
                    buttons : Ext.Msg.OK
                });
            }
        },
        failure : function(response, opts) {
            myMask.hide();
            delete myMask;
            delete option;
            Ext.Msg.show({
                title : '提示',
                msg : '网络连接失败:' + response.status + "," + response.statusText,
                buttons : Ext.Msg.OK
            });
        }
    });
};

g_v3.ajax = function(option) {
    option.method = option.method || 'POST';
    option.waitMsg = option.waitMsg || '正在执行，请稍等....';

    var myMask = new Ext.LoadMask({
        msg : option.waitMsg,
        target : option.view,
        msgCls : 'z-index:10000;'
    });
    myMask.show();

    Ext.Ajax.request({
        url : option.url,
        headers : {
            accept : 'application/json'
        },
        jsonData : option.jsonData,
        method : option.method,
        success : function(response, opts) {
            var rsResponse = Ext.decode(response.responseText);

            if (rsResponse.result === 'SUCCESS') {
                myMask.hide();
                delete myMask;
                if (option.success !== undefined) {
                    option.success.apply(option.scope, [ rsResponse, opts ]);
                } else {
                    Ext.Msg.alert('提示', '执行成功');
                }
                delete option;

            } else if ("PENDING" === rsResponse.result) {
                var jobId = rsResponse.returnObject;
                var flag = true;
                var poll = setInterval(function() {
                    if (flag) {
                        Ext.Ajax.request({
                            url : g_v3.webcontext
                            + '/service/asyncResult?jobId=' + jobId,
                            headers : {
                                accept : 'application/json'
                            },
                            method : 'GET',
                            // scope: _this,
                            success : function(response, opts) {
                                var rsResponse = Ext
                                    .decode(response.responseText);

                                if (rsResponse.result === 'SUCCESS') {
                                    flag = false;
                                    clearInterval(poll);
                                    myMask.hide();
                                    delete myMask;
                                    clearInterval(poll);
                                    if (option.success !== undefined) {
                                        option.success.apply(option.scope, [
                                            rsResponse, opts ]);
                                    } else {
                                        Ext.Msg.alert('提示', '执行成功');
                                    }
                                    delete option;

                                } else if ('EXCEPTION' === rsResponse.result) {
                                    flag = false;
                                    myMask.hide();
                                    delete myMask;
                                    clearInterval(poll);
                                    if (option.exception !== undefined) {
                                        option.exception.apply(option.scope, [
                                            rsResponse, opts ]);
                                    } else {

                                        Ext.Msg.show({
                                            title : '错误',
                                            icon : Ext.Msg.WARNING,
                                            msg : '发生错误：'
                                            + rsResponse.returnObject,
                                            buttons : Ext.Msg.OK
                                        });
                                    }

                                    delete option;
                                }
                            },
                            failure : function(response, opts) {
                                flag = false;
                                myMask.hide();
                                delete myMask;
                                delete option;
                                clearInterval(poll);
                                Ext.Msg.show({
                                    title : '错误',
                                    icon : Ext.Msg.WARNING,
                                    msg : '发生错误：' + response.status + ","
                                    + response.statusText,
                                    buttons : Ext.Msg.OK
                                });
                            }
                        });
                    } else {
                        clearInterval(poll);
                    }
                }, 5000);

            } else {
                myMask.hide();
                delete myMask;
                delete option;
                Ext.Msg.show({
                    title : '错误',
                    icon : Ext.Msg.WARNING,
                    msg : rsResponse.returnObject,
                    buttons : Ext.Msg.OK
                });
            }
        },
        failure : function(response, opts) {
            myMask.hide();
            delete myMask;
            delete option;
            Ext.Msg.show({
                title : '提示',
                msg : '网络连接失败:' + response.status + "," + response.statusText,
                buttons : Ext.Msg.OK
            });
        }
    });
};

Ext.define('V3.ux.control.WindowManager',
    {
        extend : 'Ext.Base',

        /* 调用父窗体显示消息，这样才不会因为当前窗口太小，导致的窗口变形 */
        showWarn : function(title, warnMsg) {
            var me = this;

            me.getTopWindow().Ext.Msg.show({
                title : title,
                icon : Ext.Msg.WARNING,
                msg : warnMsg,
                buttons : Ext.Msg.OK
            });
        },

        showMsg : function(title, msg) {
            var me = this;

            me.getTopWindow().Ext.Msg.show({
                title : title,
                icon : Ext.Msg.INFO,
                msg : msg,
                buttons : Ext.Msg.OK
            });
        },

        showErr : function(title, errMsg) {
            var me = this;

            me.getTopWindow().Ext.Msg.show({
                title : title,
                icon : Ext.Msg.ERROR,
                msg : errMsg,
                buttons : Ext.Msg.OK
            });
        },

        // 获取最顶级的window对象，注意跨域问题
        getTopWindow : function(host, win) {
            var me = this, host = host || window.location.host, win = win
                || window, winParent = win.parent;

            try {
                winParent.location.host;
                if (winParent.g_v3.webcontext != win.g_v3.webcontext) {
                    return win;
                }
            } catch (e) {
                return win;
            }

            if (winParent != win) {
                return me.getTopWindow(host, winParent);
            } else {
                return win;
            }
        },

        close : function(modalResult) {
            var me = this, win = me.getTopWindow().Ext.WindowManager
                .getActive();

            if (modalResult) {
                me.setModalResult(modalResult);
            }

            if (win) {
                win.close();
            } else {
                alert("close失败,无法获取当前window的id");
            }
        },

        setTitle : function(title) {
            var me = this, win = me.getTopWindow().Ext.WindowManager
                .getActive();

            if (win) {
                win.setTitle(title);
            } else {
                alert("setTitle失败,无法获取当前window的id");
            }

        },

        processModalResult : function(modalResult, clientWindowId) {
            var me = this, key = 'modalResult=' + window.myWindowId
                + "=" + clientWindowId;

            delete me.getTopWindow().g_v3[key];
        },

        setModalResult : function(modalResult) {
            var me = this, key = 'modalResult='
                + window.openerWindowId + "="
                + window.myWindowId;

            me.getTopWindow().g_v3[key] = modalResult;
        },

        showWindow : function(wopenerWindowId, wtitle, wurl,
                              wmodal, width, height, senderisTop) {
            var me = this, windowWidth = Ext.getBody().getWidth(), windowHeight = Ext
                .getBody().getHeight(), wi = width
                || (windowWidth > 800 ? 800 : windowWidth), hi = height
                || (windowHeight > 400 ? 400 : windowHeight);

            if (senderisTop) {
                var newid = Ext.id(), aurl = null, maximized = wi == 9999
                    && hi == 9999;

                if (wurl.indexOf("http://") == 0
                    || wurl.indexOf("https://") == 0) {
                    aurl = wurl;
                } else if (wurl.indexOf(g_v3.webcontext) == -1) {
                    aurl = g_v3.webcontext + wurl;
                } else {
                    aurl = wurl;
                }

                /* 创建新的窗口 */
                var popWin = Ext.create('Ext.window.Window', {
                    title : wtitle,
                    layout : {
                        type : 'fit'
                    },
                    width : wi,
                    height : hi,
                    modal : wmodal,
                    maximizable : true,
                    maximized : maximized,
                    items : [ {
                        id : newid,
                        myWindowId : newid,
                        openerWindowId : wopenerWindowId,
                        xtype : 'uxiframe',
                        src : aurl
                    } ]

                });

                if (maximized) {
                    wi = windowWidth > 800 ? 800 : windowWidth;
                    hi = windowHeight > 400 ? 400 : windowHeight;

                    popWin.width = wi;
                    popWin.height = hi;

                    popWin.x = (windowWidth - wi) / 2;
                    popWin.y = (windowHeight - hi) / 2;
                }

                popWin.show();

                return newid;
            } else {
                if (wurl.indexOf("http://") != 0
                    && wurl.indexOf("https://") != 0
                    && wurl.indexOf(g_v3.webcontext) != 0) {
                    wurl = '/..' + g_v3.webcontext + wurl;
                }

                var wopenerWindowId = wopenerWindowId
                    || window.myWindowId, topwindow = me
                    .getTopWindow(), v3;

                if (topwindow.g_v3 === undefined) {
                    v3 = window.g_v3;
                } else {
                    v3 = topwindow.g_v3;
                }

                return v3.windowManager.showWindow(wopenerWindowId,
                    wtitle, wurl, wmodal, width, height, true);
            }

        },

        // 重现设置最后打开的window大小
        resizeTopLevelWindow : function(newWidth, newHeight) {
            var targetWin = Ext.WindowManager.getActive();
            if (targetWin == null) {
                Ext.Msg
                    .show({
                        title : '提示',
                        icon : Ext.Msg.WARNING,
                        msg : '不能获取活动窗口引用。Ext.WindowManager.getActive()',
                        buttons : Ext.Msg.OK
                    });
                return;
            }
            var innerWidth = window.innerWidth, innerHeight = window.innerHeight, oldWidth = targetWin
                .getWidth(), oldHeight = targetWin.getHeight(), oldX = targetWin
                .getX(), oldY = targetWin.getY(), newX = oldX
                - (newWidth - oldWidth) / 2, newY = oldY
                - (newHeight - oldHeight) / 2;

            if (innerWidth < newWidth) {
                newWidth = innerWidth;
                newX = 0;
            }
            if (innerHeight < newHeight) {
                newHeight = innerHeight;
                newY = 0;
            }

            targetWin.setLocalX(newX);
            targetWin.setLocalY(newY);
            targetWin.setWidth(newWidth);
            targetWin.setHeight(newHeight);
        }
    });

if (g_v3) {
    g_v3.windowManager = Ext.create('V3.ux.control.WindowManager');
} else {
    alert('没有找到全局定义变量g_v3');
}