/* jinzhen begin */
/*
 * v3 数据字典感知功能实现，请不要自行维护，由jinzhen维护
 */

Ext.Ajax.timeout = 180000;

Ext.Loader.setConfig({
	disableCaching : false
});
Ext.require([ 'Ext.ux.grid.Printer', 'Ext.ux.grid.FiltersFeature',
		'Ext.ux.grid.menu.ListMenu', 'Ext.ux.grid.menu.RangeMenu',
		'Ext.ux.grid.filter.BooleanFilter', 'Ext.ux.grid.filter.DateFilter',
		'Ext.ux.grid.filter.DateTimeFilter', 'Ext.ux.grid.filter.ListFilter',
		'Ext.ux.grid.filter.NumericFilter', 'Ext.ux.grid.filter.StringFilter',
		'Ext.ux.SlidingPager', 'Ext.ux.grid.filter.Filter',
		'Ext.grid.PagingScroller'

]);
Ext.Loader.setConfig({
	disableCaching : true
});

// Ext.state.Manager.setProvider(new Ext.state.CookieProvider());
/* Ext.DomQuery.select("[class*=x-column-header-text]", grid.dom, null, false) */
function noDictPermissionColRender(value, metaData, record, rowIndex, colIndex,
		store, view) {
	return "****";
}

Ext
		.define(
				'Ext.ux.IFrame',
				{
					extend : 'Ext.Component',

					alias : 'widget.uxiframe',

					loadMask : 'Loading...',

					src : 'about:blank',
					openerWindowId : '',
					myWindowId : '',

					renderTpl : [ '<iframe myWindowId="" openerWindowId="" src="{src}" name="{frameName}" width="100%" height="100%" frameborder="0"></iframe>' ],

					initComponent : function() {
						this.callParent();

						this.frameName = this.frameName || this.id + '-frame';

						this.addEvents('beforeload', 'load');

						Ext.apply(this.renderSelectors, {
							iframeEl : 'iframe'
						});
					},

					initEvents : function() {
						var me = this;
						me.callParent();
						me.iframeEl.on('load', me.onLoad, me);
					},

					initRenderData : function() {
						return Ext.apply(this.callParent(), {
							src : this.src,
							frameName : this.frameName
						});
					},

					getBody : function() {
						var doc = this.getDoc();
						return doc.body || doc.documentElement;
					},

					getDoc : function() {
						try {
							return this.getWin().document;
						} catch (ex) {
							return null;
						}
					},

					getWin : function() {
						var me = this, name = me.frameName, win = Ext.isIE ? me.iframeEl.dom.contentWindow
								: window.frames[name];
						return win;
					},

					getFrame : function() {
						var me = this;
						return me.iframeEl.dom;
					},

					beforeDestroy : function() {
						var me = this, myWindowId = me.myWindowId, openerWindowId = me.openerWindowId, doc, prop, key = 'modalResult='
								+ openerWindowId + "=" + myWindowId, modalResult = g_v3[key];

						if (me.rendered) {
							try {
								doc = me.getDoc();
								if (doc) {
									Ext.EventManager.removeAll(doc);
									for (prop in doc) {
										if (doc.hasOwnProperty
												&& doc.hasOwnProperty(prop)) {
											delete doc[prop];
										}
									}
								}
							} catch (e) {
							}
						}

						me.callParent();
						var desktopW = g_v3.windowManager.getTopWindow();
						if (desktopW && myWindowId) {
							var openerWindow = Ext.getCmp(openerWindowId);

							if (openerWindow) {
								var task = new Ext.util.DelayedTask(function() {
									openerWindow.getWin().g_v3.windowManager
											.processModalResult(modalResult,
													myWindowId);
								});
								task.delay(200);
							} else {
								var task = new Ext.util.DelayedTask(function() {
									desktopW.g_v3.windowManager
											.processModalResult(modalResult,
													myWindowId);
								});
								task.delay(200);
							}
						}

					},

					onLoad : function() {
						var me = this, doc = me.getDoc(), fn = me.onRelayedEvent;

						if (doc) {

							try {
								Ext.EventManager.removeAll(doc);

								// These events need to be relayed from the
								// inner document
								// (where they stop
								// bubbling) up to the outer document. This has
								// to be done at
								// the DOM level so
								// the event reaches listeners on elements like
								// the document
								// body. The effected
								// mechanisms that depend on this bubbling
								// behavior are listed
								// to the right
								// of the event.
								Ext.EventManager.on(doc, {
									mousedown : fn, // menu dismisal
									// (MenuManager) and
									// Window onMouseDown (toFront)
									mousemove : fn, // window resize drag
									// detection
									mouseup : fn, // window resize termination
									click : fn, // not sure, but just to be safe
									dblclick : fn, // not sure again
									scope : me
								});
							} catch (e) {
								// cannot do this xss
							}

							// We need to be sure we remove all our events from
							// the iframe on
							// unload or we're going to LEAK!
							Ext.EventManager.on(window, 'unload',
									me.beforeDestroy, me);

							this.el.unmask();
							this.fireEvent('load', this);

						} else if (me.src && me.src != '') {

							this.el.unmask();
							this.fireEvent('error', this);
						}
						try {
							this.getWin().myWindowId = me.myWindowId;
							this.getWin().openerWindowId = me.openerWindowId;
						} catch (ex) {
						}

					},

					onRelayedEvent : function(event) {
						// relay event from the iframe's document to the
						// document that owns the
						// iframe...

						var iframeEl = this.iframeEl,

						// Get the left-based iframe position
						iframeXY = Ext.Element.getTrueXY(iframeEl), originalEventXY = event
								.getXY(),

						// Get the left-based XY position.
						// This is because the consumer of the injected event
						// (Ext.EventManager)
						// will
						// perform its own RTL normalization.
						eventXY = Ext.EventManager
								.getPageXY(event.browserEvent);

						// the event from the inner document has XY relative to
						// that document's
						// origin,
						// so adjust it to use the origin of the iframe in the
						// outer document:
						event.xy = [ iframeXY[0] + eventXY[0],
								iframeXY[1] + eventXY[1] ];

						event.injectEvent(iframeEl); // blame the iframe for
						// the event...

						event.xy = originalEventXY; // restore the original XY
						// (just for safety)
					},

					load : function(src) {
						var me = this, text = me.loadMask, frame = me
								.getFrame();

						if (me.fireEvent('beforeload', me, src) !== false) {
							if (text && me.el) {
								me.el.mask(text);
							}

							frame.src = me.src = (src || me.src);
						}
					}
				});

Ext
		.define(
				'V3.ux.control.WindowManager',
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
	g_v3.mergeCells = function(grid, cols) {
		var arrayTr = document.getElementById(grid.getId() + "-body").firstChild.firstChild
				.getElementsByTagName('tr');

		var trCount = arrayTr.length;
		var arrayTd;
		var td;
		var merge = function(rowspanObj, removeObjs) { // 定义合并函数
			if (rowspanObj.rowspan != 1) {
				arrayTd = arrayTr[rowspanObj.tr].getElementsByTagName("td"); // 合并行
				td = arrayTd[rowspanObj.td - 1];
				td.rowSpan = rowspanObj.rowspan;
				td.vAlign = "middle";
				Ext.each(removeObjs, function(obj) { // 隐身被合并的单元格
					arrayTd = arrayTr[obj.tr].getElementsByTagName("td");
					arrayTd[obj.td - 1].style.display = 'none';
				});
			}
		};
		var rowspanObj = {}; // 要进行跨列操作的td对象{tr:1,td:2,rowspan:5}
		var removeObjs = []; // 要进行删除的td对象[{tr:2,td:2},{tr:3,td:2}]
		var col;
		Ext.each(cols, function(colIndex) { // 逐列去操作tr
			var rowspan = 1;
			var divHtml = null;// 单元格内的数值
			for (var i = 1; i < trCount; i++) { // i=0表示表头等没用的行
				arrayTd = arrayTr[i].getElementsByTagName("td");
				var cold = 0;
				col = colIndex + cold;// 跳过RowNumber列和check列
				if (!divHtml) {
					divHtml = arrayTd[col - 1].innerHTML;
					rowspanObj = {
						tr : i,
						td : col,
						rowspan : rowspan
					}
				} else {
					var cellText = arrayTd[col - 1].innerHTML;
					var addf = function() {
						rowspanObj["rowspan"] = rowspanObj["rowspan"] + 1;
						removeObjs.push({
							tr : i,
							td : col
						});
						if (i == trCount - 1)
							merge(rowspanObj, removeObjs);// 执行合并函数
					};
					var mergef = function() {
						merge(rowspanObj, removeObjs);// 执行合并函数
						divHtml = cellText;
						rowspanObj = {
							tr : i,
							td : col,
							rowspan : rowspan
						}
						removeObjs = [];
					};
					if (cellText == divHtml) {
						if (colIndex != cols[0]) {
							var leftDisplay = arrayTd[col - 2].style.display;// 判断左边单元格值是否已display
							if (leftDisplay == 'none')
								addf();
							else
								mergef();
						} else
							addf();
					} else
						mergef();
				}
			}
		});
	};

} else {
	alert('没有找到全局定义变量g_v3');
}

/* tab ==> enter form and grid begin */
Ext.override(Ext.grid.plugin.CellEditing, {
	onSpecialKey : function(ed, field, e) {
		var sm;

		if (e.getKey() === e.TAB || e.getKey() == e.ENTER) {
			e.stopEvent();

			if (ed) {
				ed.onEditorTab(e);
			}

			sm = ed.up('tablepanel').getSelectionModel();

			if (sm.onEditorTab) {
				return sm.onEditorTab(ed.editingPlugin, e);
			}
		}
	}
});

Ext
		.getDoc()
		.on(
				'keydown',
				function(event, target) {

					if (event.ENTER == event.getKey()) {
						if (!event.shiftKey) {
							var targetEl = Ext.get(target.id);

							var fieldEl = targetEl.up('[class*=x-field]') || {};

							var field = Ext.getCmp(fieldEl.id);
							if (field === undefined) {
								return;
							}
							/* if (field && field.isValid()) { */

							var next = field.next('[isFormField]');
							if (next === null) {
								var container = targetEl
										.up('[class*=x-container]');
								if (container != null
										&& container.dom.nextSibling != null) {

									var nextContainer = Ext
											.getCmp(container.dom.nextSibling.id);
									if (nextContainer.xtype == "container") {
										if (nextContainer.items
												&& nextContainer.items.items instanceof Array) {
											if (nextContainer.items.items.length > 0) {

												next = nextContainer.items.items[0];
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
						} else {
							var targetEl = Ext.get(target.id);

							var fieldEl = targetEl.up('[class*=x-field]') || {};

							var field = Ext.getCmp(fieldEl.id);
							if (field === undefined) {
								return;
							}

							/* if (field && field.isValid()) { */

							var next = field.prev('[isFormField]');
							if (next === null) {

								var container = targetEl
										.up('[class*=x-container]');
								if (container != null
										&& container.dom.previousSibling != null) {

									var nextContainer = Ext
											.getCmp(container.dom.previousSibling.id);
									if (nextContainer.xtype == "container") {
										if (nextContainer.items
												&& nextContainer.items.items instanceof Array) {
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

						/* } */
					} else if (event.getKey() == event.BACKSPACE) {

						if (target != null
								&& target.tagName != null
								&& (target.tagName.toLowerCase() == "input" || target.tagName
										.toLowerCase() == "textarea")) {
							// readOnly
							var fieldEl, fieldCmp;
							fieldEl = Ext.get(target).up('table.x-form-item');
							if (fieldEl && fieldEl.id) {
								fieldCmp = Ext.getCmp(fieldEl.id);
							}
							if (fieldCmp
									&& (fieldCmp.editable == false || fieldCmp.readOnly == true)) {
								event.stopEvent();
							}
						} else {
							event.stopEvent();
						}
					}

				});

Ext.override(Ext.selection.CellModel, {
	initKeyNav : function(view) {
		var me = this;

		if (!view.rendered) {
			view.on('render',
					Ext.Function.bind(me.initKeyNav, me, [ view ], 0), me, {
						single : true
					});
			return;
		}

		view.el.set({
			tabIndex : -1
		});

		me.keyNav = new Ext.util.KeyNav({
			target : view.el,
			ignoreInputFields : true,
			up : me.onKeyUp,
			down : me.onKeyDown,
			right : me.onKeyRight,
			left : me.onKeyLeft,
			tab : me.onKeyTab,
			enter : me.onKeyTab,
			scope : me
		});
	}
});

/* tab ==> enter form and grid end */

/* grid and tree picker */
Ext.define('V3.control.text.TreePricker', {
	extend : 'Ext.form.field.Picker',
	alias : 'widget.v3treetriggerfield',
	displayField : null,
	v3remotevalid : '',
	valueField : null,
	matchFieldWidth : false,
	store : null,
	columns : null,
	pickerWidth : 330,
	pickerHeight : 240,
	v3id : Ext.id(),
	refObjectId : '',
	dictable : '',
	diccolumn : '',
	v3fieldList : [],
	v3dynamicObject : [],
	v3CodeValue : null,
	v3NameValue : null,
	v3resultcol : '',
	v3labelcols : [],
	v3columnList : [],
	v3selection : 'SINGLE',
	v3params : {
		objectId : this.refObjectId
	},

	getRawValue : function() {
		var me = this;
		var v;
		if (me.v3CodeValue) {
			if (me.inputEl
					&& me.inputEl.getValue() != Ext.value(me.rawValue, '')
					&& me.inputEl.getValue() != me.v3NameValue) {
				me.v3CodeValue = me.inputEl.getValue();
			}
			v = (me.inputEl ? me.v3CodeValue : Ext.value(me.rawValue, ''));
		} else {
			v = (me.inputEl ? me.inputEl.getValue() : Ext
					.value(me.rawValue, ''));
		}
		me.rawValue = v;
		return v;
	},
	onRender : function() {
		var me = this;
		me.callParent();
		me.inputEl.on('blur', me.onBlurHandler, me.inputEl);
		me.inputEl.on('focus', me.onFocusHandler, me.inputEl);

	},

	listeners : {
		expand : {
			fn : function(field, eOpts) {

				var me = field;
				var store = Ext.getStore(me.v3id + 'treeStore');
				me.v3params.objectId = me.refObjectId;
				Ext.apply(store.proxy.extraParams, me.v3params);

				store.getRootNode().expand();

			},
			scope : this
		}
	},
	createPicker : function() {
		var me = this;

		var picker = me.createComponent();
		picker.on('itemdblclick', me.onItemDblClick, me);
		me.on('blur', me.onBlurHandler, me);
		return picker;
	},
	createComponent : function() {
		var me = this;
		me.v3id = Ext.id();
		me.v3params.objectId = me.refObjectId;
		var store = Ext.create('Ext.data.TreeStore', {
			id : me.v3id + 'treeStore',
			fields : me.v3fieldList,
			nodeParam : 'pid',
			root : {
				id : '#',
				text : '根节点',
				leaf : false
			},
			proxy : {
				type : 'ajax',
				extraParams : me.v3params,
				actionMethods : 'post',
				url : g_v3.webcontext + '/service/system/dynamic/tree/',
				headers : {
					accept : 'application/json'
				},
				reader : {
					type : 'mytreejson',
					root : 'returnObject',
					totalProperty : 'returnTag'
				}
			}
		});

		// me.v3columnList[0].locked=true;
		var picker = Ext.create('Ext.tree.Panel', {
			id : me.v3id + 'treeGrid',
			enableColumnHide : false,
			floating : true,
			width : !me.width || (me.width - me.labelWidth < 330) ? 330
					: me.width - me.labelWidth,
			height : 240,
			store : store,
			rootVisible : true,
			columns : me.v3columnList,
			renderTo : Ext.getBody()
		});
		return picker;
	},
	onItemDblClick : function(view, record, item, index, e, eOpts) {
		var me = this;
		if (!me.v3resultcol) {

			Ext.Msg.show({
				title : '提示',
				icon : Ext.Msg.WARNING,
				msg : '动态对象列类型定义错误（ID,CODE,LABEL）:' + me.refObjectResult,
				buttons : Ext.Msg.OK
			});
		} else {
			me.v3dynamicObject = [];
			me.v3dynamicObject.push(record);
			me.getPicker().hide();

			me.setRawValue(record.get(me.v3resultcol));
			me.v3remotevalid = record.get(me.v3resultcol);
			me.inputEl.focus();
		}

	},
	onFocusHandler : function(e, target) {
		var targetEl = Ext.get(target.id);

		var fieldEl = targetEl.up('[class*=x-field]') || {};
		var grid = targetEl.up('[class*=x-grid]');

		var field = Ext.getCmp(fieldEl.id);

		var me = field;

		var v3dynamicObject = me.v3dynamicObject;

		if (!grid && v3dynamicObject.length > 0) {
			var record = v3dynamicObject[0];
			if (record instanceof Ext.data.Model) {
				me.v3CodeValue = record.get(me.v3resultcol);
			} else {
				me.v3CodeValue = record[me.v3resultcol];
			}
		}

		if (!grid && me.v3CodeValue) {
			me.setIValue(me.v3CodeValue);
		}
		if (grid) {
			var value = field.getValue();
			if (value != field.v3remotevalid) {
				field.v3remotevalid = null;
			}
		}
	},
	setV3Params : function(name, value) {
		if (me.v3params[name] != value) {

		}
		me.v3params[name] = value;

	},
	onBlurHandler : function(e, target) {

		var targetEl = Ext.get(target.id);
		var fieldEl, field, me, grid;
		if (!targetEl) {
			grid = e.up('[class*=x-grid]');
			field = e;
			me = field;
		} else {
			fieldEl = targetEl.up('[class*=x-field]') || {};
			grid = targetEl.up('[class*=x-grid]');
			field = Ext.getCmp(fieldEl.id);
			me = field;
		}

		var value = field.getValue();
		if (value == "") {
			return;
		}
		if (value != field.v3remotevalid) {
			var params = {};
			for ( var p in me.v3params) {
				params[p] = me.v3params[p];
			}

			params.objectId = me.refObjectId;
			params.pid = 'null';
			params.searchvalue = value;
			params.searchby = 'equal';
			params.page = 1;
			params.limit = 1;
			var queryString = Ext.Object.toQueryString(params);
			Ext.Ajax
					.request({
						async : false,
						url : g_v3.webcontext
								+ '/service/system/dynamic/tree/?'
								+ queryString,
						headers : {
							accept : 'application/json',
							'Content-Type' : 'application/json'
						},

						jsonData : params,
						method : 'POST',
						scope : me,
						success : function(response, opts) {
							var obj = Ext.decode(response.responseText);

							if (obj.result == 'SUCCESS'
									&& obj.returnObject.length > 0) {
								me.v3dynamicObject = [];
								me.v3dynamicObject.push(obj.returnObject[0]);
								obj.returnObject[0].get = function(name) {
									return this[name];

								};
								field.v3remotevalid = value;
							} else if (obj.result == 'EXCEPTION') {
								me.v3dynamicObject = [];
								me.setIValue('');
								Ext.Msg.show({
									title : '错误',
									icon : Ext.Msg.WARNING,
									msg : '发生错误：' + obj.returnObject,
									buttons : Ext.Msg.OK
								});
							} else {
								me.v3dynamicObject = [];
								me.setIValue('');
								Ext.Msg.show({
									title : '错误',
									icon : Ext.Msg.WARNING,
									msg : '输入的值不存在:' + value,
									buttons : Ext.Msg.OK
								});
							}
						},
						failure : function(response, opts) {
							me.v3dynamicObject = [];
							me.setIValue('');
							Ext.Msg.show({
								title : '错误',
								icon : Ext.Msg.WARNING,
								msg : '网络连接错误',
								buttons : Ext.Msg.OK
							});
						}
					});
		}

		var v3dynamicObject = me.v3dynamicObject;

		if (!grid && v3dynamicObject.length > 0
				&& (me.v3labelcols.length == 1 || me.v3labelcols.length == 2)) {
			var record = v3dynamicObject[0];
			if (record instanceof Ext.data.Model) {
				me.v3CodeValue = record.get(me.v3resultcol);
				if (me.v3labelcols.length == 1) {
					me.v3NameValue = record.get(me.v3labelcols[0]);
				} else if (me.v3labelcols.length == 2) {
					var codeV = record.get(me.v3labelcols[0]);
					if (codeV && codeV.length > 10) {
						codeV = codeV.substring(0, 7) + '..';
					}
					me.v3NameValue = '[' + codeV + ']'
							+ record.get(me.v3labelcols[1]);
				}
				me.setIValue(me.v3NameValue);
			} else {

				me.v3CodeValue = record[me.v3resultcol];

				if (me.v3labelcols.length == 1) {
					me.v3NameValue = record[me.v3labelcols[0]];
				} else if (me.v3labelcols.length == 2) {
					var codeV = record[me.v3labelcols[0]];
					if (codeV && codeV.length > 10) {
						codeV = codeV.substring(0, 7) + '..';
					}
					me.v3NameValue = '[' + codeV + ']'
							+ record[me.v3labelcols[1]];
				}
				me.setIValue(me.v3NameValue);
			}
		}

	},
	setValue : function(value) {
		var me = this;
		me.setRawValue(value);
		me.v3CodeValue = value;
		me.v3NameValue = null;
		me.v3dynamicObject = [];
		return me;
	},
	setIValue : function(value) {
		var me = this;
		me.setRawValue(value);
		return me;
	},
	getValue : function() {
		return this.getRawValue();
	},
	onTriggerClick : function() {
		var me = this;
		if (me.isExpanded) {
			return;
		}

		var store = Ext.getStore(me.v3id + 'treeStore');
		if (store) {
			me.v3params.objectId = me.refObjectId;
			Ext.apply(store.proxy.extraParams, me.v3params);

		}

		if (!me.readOnly && !me.disabled) {
			if (!me.isExpanded) {
				me.expand();
			}
			me.inputEl.focus();
		}
	}
});

Ext
		.define(
				'V3.form.field.GridPicker',
				{
					extend : 'Ext.form.field.Picker',
					alias : 'widget.v3gridtriggerfield',

					columns : null,

					diccolumn : '',

					dictable : '',

					displayField : null,

					matchFieldWidth : false,

					// 动态对象ID
					refObjectId : '',

					store : null,

					v3CacheEnabled : true,

					// 提交值
					v3CodeValue : null,

					// grid的column列表
					v3columnList : [],

					// 选中的对象
					v3dynamicObject : [],

					// store的字段列表
					v3fieldList : [],

					// 生成的ID
					v3id : Ext.id(),

					// 显示的字段名组，length为1或者2
					v3labelcols : [],

					// 显示值
					v3NameValue : null,

					// store查询参数
					v3params : {},

					// 当参数变化时是否清空值，默认true
					v3ParamChange : true,

					// 当picker显示时，是否输入框变化就重现检索，默认true
					v3ReloadOnChange : true,

					// 是否验证过
					v3remotevalid : '',

					// 提交后台的字段名
					v3resultcol : '',

					v3selection : 'SINGLE',

					valueField : null,

					getRawValue : function() {
						var me = this, v;

						if (!Ext.isEmpty(me.v3CodeValue)) {
							if (me.inputEl
									&& me.inputEl.getValue() != Ext.value(
											me.rawValue, '')
									&& me.inputEl.getValue() != me.v3NameValue) {
								me.v3CodeValue = me.inputEl.getValue();
							}
							v = (me.inputEl ? me.v3CodeValue : Ext.value(
									me.rawValue, ''));
						} else {
							v = (me.inputEl ? me.inputEl.getValue() : Ext
									.value(me.rawValue, ''));
						}

						me.rawValue = v;
						return v;
					},

					onRender : function() {
						var me = this;

						me.callParent();

						me.inputEl.on('blur', me.onBlurHandler, me);
						me.inputEl.on('focus', me.onFocusHandler, me);
					},
					onChange : function(newVal, oldVal) {
						this.callParent();

						var me = this;

						if (!this.suspendCheckChange) {
							me.fireEvent('v3change', me, newVal, oldVal);
						}

					},
					onExpand : function() {
						var me = this, store = Ext.getStore(me.v3id
								+ 'popStore'), input = Ext.getCmp(me.v3id
								+ 'searchCondition'), codeValue = me
								.v3InitCodeValue();

						if (me.v3CodeValue != codeValue) {
							me.v3remotevalid = '';
							me.v3dynamicObject = [];

							if (input.getValue != '') {
								input.suspendEvent('change');
								input.setValue('');
								input.resumeEvent('change');
							}
						}

						Ext.apply(store.proxy.extraParams, me.v3params);
						store.getProxy().setExtraParam('searchvalue', null);
						store.getProxy().setExtraParam('searchby', null);

						store.loadPage(1);

						var task = new Ext.util.DelayedTask(function() {
							input.focus();
						});
						task.delay(200);

					},

					createPicker : function() {
						var me = this, picker = me.createComponent();

						return picker;
					},

					createComponent : function() {
						var me = this, width = me.getWidth(), labelWidth = me.labelWidth || 100, panelWidth = (width
								- labelWidth < 335) ? 330
								: (width - labelWidth - 5), // 有5个像素的边框要去掉
						selModel, pickerstore, picker, columnList = [], toolList = [];

						if (!me.v3resultcol) {
							Ext.Msg.show({
								title : '提示',
								msg : '动态对象列类型定义错误（ID,CODE,LABEL）',
								buttons : Ext.Msg.CANCEL
							});
							return;
						}

						me.v3id = Ext.id();
						me.v3params.objectId = me.refObjectId;

						toolList
								.push({
									xtype : 'textfield',
									flex : 1,
									fieldLabel : '搜索',
									labelWidth : 50,
									id : me.v3id + 'searchCondition',
									enableKeyEvents : true,
									listeners : {
										keyup : {
											fn : function(field, e, eOpts) {
												var newValue, store;

												if (me.v3ReloadOnChange === false) {
													if (e.keyCode == Ext.EventObject.RETURN) {
														newValue = field.value;
														store = Ext
																.getStore(me.v3id
																		+ 'popStore');

														store.proxy.extraParams.searchvalue = newValue;
														store.proxy.extraParams.searchby = 'like';

														store.loadPage(1);
													}
												}
											},
											scope : this,
											buffer : 500
										},
										change : {
											fn : function(field, newValue,
													oldValue, eOpt) {
												if (me.v3ReloadOnChange === true) {
													var store = Ext
															.getStore(me.v3id
																	+ 'popStore');

													store.proxy.extraParams.searchvalue = newValue;
													store.proxy.extraParams.searchby = 'like';

													store.loadPage(1);
												}
											},
											buffer : 500,
											scope : this

										}
									}
								});

						if (me.v3selection !== 'SINGLE') {
							me.setEditable(false);

							selModel = Ext
									.create(
											'Ext.selection.CheckboxModel',
											{
												mode : 'SIMPLE',
												listeners : {
													select : {
														fn : function(rowmodel,
																record, index,
																eOpts) {
															var me = this, dyObjList = me.v3dynamicObject, val;

                                                            if (Ext.each(dyObjList, function (dyObj, index, self) {
                                                                    return !Ext.Object.equals(dyObj.data, record.data);
                                                                })) {
                                                                Ext.Array.push(dyObjList, record);
                                                            }

															// 初始化值
															val = me
																	.v3InitCodeValue();
															me.v3remotevalid = val;
															me.setRawValue(val);
														},
														scope : this
													},
													deselect : {
														fn : function(rowmodel,
																record, index,
																eOpts) {
															var me = this, dyObjList = me.v3dynamicObject, info = record
																	.getData();

															var item = Ext.Array
																	.findBy(
																			dyObjList,
																			function(
																					dyObj) {
																				return Ext.Object
																						.equals(
																								info,
																								dyObj
																										.getData());
																			});

															Ext.Array.remove(
																	dyObjList,
																	item);

															var val = me
																	.v3InitCodeValue();

															me.v3remotevalid = val;
															me.setRawValue(val);
														},
														scope : this
													}
												}
											});

							// 多选情况加上对应的确认和清空按钮
							toolList.push({
								xtype : 'button',
								iconCls : 'saveclose',
								width : 60,
								text : '确 认',
								listeners : {
									click : {
										fn : function(button, e, eOpts) {
											var me = this;
											me.getPicker().hide();
										},
										scope : this
									}
								}
							});
							toolList.push({
								xtype : 'button',
								iconCls : 'delete',
								width : 60,
								text : '清 空',
								listeners : {
									click : {
										fn : function(button, e, eOpts) {
											var me = this;

											button.up('grid')
													.getSelectionModel()
													.deselectAll();

											me.v3dynamicObject = [];
											me.v3remotevalid = '';
											me.setRawValue('');
										},
										scope : this
									}
								}
							});
						}

						pickerstore = Ext
								.create(
										'Ext.data.Store',
										{
											storeId : me.v3id + 'popStore',
											pageSize : 20,
											remoteSort : true,
											fields : me.v3fieldList,
											proxy : {
												type : 'ajax',
												extraParams : me.v3params,
												actionMethods : 'post',
												url : g_v3.webcontext
														+ '/service/system/dynamic/grid/',
												headers : {
													accept : 'application/json'
												},
												reader : {
													type : 'myjson',
													totalProperty : 'returnTag'
												}
											},
											listeners : {
												load : function(store, records,
														successful, eOpts) {
													var dyObjList = me.v3dynamicObject, selectionModel = me
															.v3GetGrid()
															.getSelectionModel(), objInfo;

													if (records
															&& records.length > 0) {
														selectionModel
																.select(0);
														input = Ext
																.getCmp(me.v3id
																		+ 'searchCondition');
														input.focus();
													}

													// 如果获取数据成功，并且已选择了对象，则遍历其，并把对应的数据打上勾
													if (successful
															&& me.v3selection !== 'SINGLE') {
														Ext.Array
																.each(
																		dyObjList,
																		function(
																				dyObj) {
																			objInfo = dyObj
																					.getData();
																			Ext.Array
																					.each(
																							records,
																							function(
																									record) {
																								if (Ext.Object
																										.equals(
																												objInfo,
																												record
																														.getData())) {
																									selectionModel
																											.select(
																													record,
																													true,
																													true);
																									return false;
																								}
																							});
																		});
													}

												}
											}
										});

						Ext.Array.each(me.v3columnList, function(column) {
							column['flex'] = 1;
							columnList.push(column);
						});

						picker = Ext.create('Ext.grid.Panel', {
							id : me.v3id + 'popGrid',
							floating : true,
							enableColumnHide : false,
							height : 240,
							width : panelWidth,
							store : pickerstore,
							columns : columnList,
							selModel : selModel,

							dockedItems : [ {
								xtype : 'pagingtoolbar',
								dock : 'bottom',
								displayInfo : true,
								store : me.v3id + 'popStore',
								id : me.v3id + 'pagingbar'
							}, {
								xtype : 'toolbar',
								dock : 'bottom',
								items : toolList
							} ],

							listeners : {
								itemdblclick : {
									fn : function(v, record, item, index, e,
											eOpts) {
										me.v3dynamicObject = [];
										me.v3dynamicObject.push(record);
										me.v3remotevalid = record
												.get(me.v3resultcol);

										me.getPicker().hide();
									}
								},
								hide : {
									fn : function(panel, eOpts) {
										me.inputEl.focus();
									}
								}
							},
							renderTo : Ext.getBody()
						});

						if (me.v3selection !== 'SINGLE') {
							picker.suspendEvent('itemdblclick');
						}

						return picker;
					},

					onFocusHandler : function(e, target) {
						var me = this, store = Ext.getStore(me.v3id
								+ 'popStore'), v3dynamicObject = me.v3dynamicObject;

						if (store) {
							me.v3params.objectId = me.refObjectId;
							Ext.apply(store.proxy.extraParams, me.v3params);
						}

						if (!(me.inEditor == true)
								&& v3dynamicObject.length > 0) {
							var codeValue = me.v3InitCodeValue();

							if (codeValue != me.v3CodeValue) {
								me.v3SetCodeValue(codeValue);
							}
						}

						if (!(me.inEditor == true)
								&& !Ext.isEmpty(me.v3CodeValue)) {
							me.setIValue(me.v3CodeValue);
						}

						if (me.inEditor == true) {
							var value = me.getValue();
							if (Ext.isEmpty(value)) {
								value = me.v3InitCodeValue();
								me.setRawValue(value);
							}
							if (value != me.v3remotevalid) {
								me.v3remotevalid = '';
							}
						}
					},

					onBlurHandler : function(e, target) {
						var me = this, value = me.getValue();

						if (Ext.isEmpty(value)) {
							me.setValue('');
							return;
						}

						if (me.v3selection === 'SINGLE') {
							this.validValueAndDisplay();
						} else {
							if (me.v3InitCodeValue() === value) {
								var nameValue = me.v3InitNameValue();

								me.v3SetNameValue(nameValue);
								me.setIValue(nameValue);
							}
						}

					},

					/*
					 * 获取动态对象的grid
					 */
					v3GetGrid : function() {
						var me = this;

						return Ext.getCmp(me.v3id + 'popGrid');
					},

					/*
					 * 获取显示值
					 */
					v3InitNameValue : function() {
						var me = this, dyObjList = me.v3dynamicObject, labelCols = me.v3labelcols, selType = me.v3selection, val = '';

						if (selType !== 'SINGLE') {
							Ext.Array.each(dyObjList, function(record) {
								val += me.v3InitSingleName(record, labelCols)
										+ ',';
							});
						} else if (dyObjList.length > 0) {
							val = me.v3InitSingleName(dyObjList[0], labelCols);
						}

						return val;
					},

					/*
					 * 获取单个显示值
					 */
					v3InitSingleName : function(record, labelCols) {
						var val = '', codeV = '';

						if (record instanceof Ext.data.Model) {
							if (labelCols.length === 1) {
								val = record.get(labelCols[0]);
							} else if (labelCols.length === 2) {
								codeV = record.get(labelCols[0]);
								if (codeV && codeV.length > 10) {
									codeV = codeV.substring(0, 7) + '..';
								}
								val = '[' + codeV + ']'
										+ record.get(labelCols[1]);
							}
						} else {
							if (labelCols.length === 1) {
								val = record[labelCols[0]];
							} else if (labelCols.length === 2) {
								codeV = record[labelCols[0]];
								if (codeV && codeV.length > 10) {
									codeV = codeV.substring(0, 7) + '..';
								}
								val = '[' + codeV + ']' + record[labelCols[1]];
							}
						}

						return val
					},

					/*
					 * 获取提交值
					 */
					v3InitCodeValue : function() {
						var me = this, dyObjList = me.v3dynamicObject, resultCol = me.v3resultcol, selType = me.v3selection, val = ',';

						if (selType !== 'SINGLE') {
							Ext.Array.each(dyObjList, function(record) {
								val += me.v3InitSingleCode(record, resultCol)
										+ ',';
							});
						} else if (dyObjList.length > 0) {
							val = me.v3InitSingleCode(dyObjList[0], resultCol);
						} else {
							val = '';
						}

						return val;
					},

					/*
					 * 获取单个提交值
					 */
					v3InitSingleCode : function(record, resultCol) {
						var val = '';

						if (record instanceof Ext.data.Model) {
							val = record.get(resultCol);
						} else {
							val = record[resultCol];
						}

						return val;
					},

					/*
					 * 验证value是否存在，并显示显示值，现在只可以被使用于单选
					 */
					validValueAndDisplay : function() {
						var me = this, value = me.getValue();

						if (value != me.v3remotevalid) {
							var params = {};

							for ( var p in me.v3params) {
								params[p] = me.v3params[p];
							}

							params.searchvalue = value;
							params.searchby = 'equal';
							params.page = 1;
							params.objectId = me.refObjectId;
							params.limit = 1;
							var queryString = Ext.Object.toQueryString(params);
							Ext.Ajax
									.request({
										async : false,
										url : g_v3.webcontext
												+ '/service/system/dynamic/grid/?'
												+ queryString,
										headers : {
											accept : 'application/json',
											'Content-Type' : 'application/json'
										},
										jsonData : params,
										method : 'POST',
										scope : me,
										success : function(response, opts) {
											var obj = Ext
													.decode(response.responseText);

											if (obj.result == 'SUCCESS'
													&& obj.returnObject.length > 0) {
												me.v3dynamicObject = [];

												me.v3dynamicObject
														.push(obj.returnObject[0]);
												obj.returnObject[0].get = function(
														name) {
													return this[name];
												};
												me.v3remotevalid = value;
											} else if (obj.result == 'EXCEPTION') {
												me.v3dynamicObject = [];
												me.setIValue('');
												me.v3remotevalid = '';
												Ext.Msg.show({
													title : '错误',
													icon : Ext.Msg.WARNING,
													msg : '发生错误：'
															+ obj.returnObject,
													buttons : Ext.Msg.OK
												});
											} else {
												me.v3dynamicObject = [];
												me.setIValue('');
												Ext.Msg.show({
													title : '错误',
													icon : Ext.Msg.WARNING,
													msg : '输入的值不存在:' + value,
													buttons : Ext.Msg.OK
												});
											}
										},
										failure : function(response, opts) {
											me.v3dynamicObject = [];
											me.setIValue('');
											Ext.Msg.show({
												title : '错误',
												icon : Ext.Msg.WARNING,
												msg : '网络连接错误',
												buttons : Ext.Msg.OK
											});
										}
									});
						}

						if (!(me.inEditor == true)
								&& me.v3dynamicObject.length > 0
								&& (me.v3labelcols.length == 1 || me.v3labelcols.length == 2)) {
							var record = me.v3dynamicObject[0], resultCol = me.v3resultcol, labelCols = me.v3labelcols, codeValue = me
									.v3InitSingleCode(record, resultCol), nameValue = me
									.v3InitSingleName(record, labelCols);

							if (me.v3CodeValue != codeValue) {
								me.v3SetCodeValue(codeValue);
							}

							me.v3SetNameValue(nameValue);
							me.setIValue(nameValue);
						}
					},

					v3SetNameValue : function(newVal) {
						var me = this;

						me.v3NameValue = newVal;
					},

					/*
					 * 提交值改变后触发v3change事件
					 */
					v3SetCodeValue : function(newVal) {
						var me = this;

						me.v3CodeValue = newVal;

						if (!this.suspendCheckChange) {
							var oldVal = me.lastValue;
							if (!me.isEqual(newVal, oldVal) && !me.isDestroyed) {
								me.lastValue = newVal;
								me.fireEvent('v3change', me, newVal, oldVal);
							}
						}
					},

					/*
					 * 设置查询参数,fieldName为String时newValue就是赋的值，fieldName如果是对象newValue就不在需要
					 * fieldName: String/Object newValue: Object
					 */
					setParams : function(fieldName, newValue) {
						var me = this, params = me.v3params, single = (typeof fieldName == 'string');

						if (single) {
							me.checkParamsChange(fieldName, newValue);
							params[fieldName] = newValue;
						} else {
							for (name in fieldName) {
								me.checkParamsChange(name, fieldName[name]);
								params[name] = fieldName[name];
							}
						}
					},

					/*
					 * v3ParamChange如果是true，设置参数后清空field
					 */
					checkParamsChange : function(fieldName, newValue) {
						var me = this;

						if (me.v3ParamChange && me.v3dynamicObject.length > 0
								&& me.v3CodeValue != ''
								&& me.v3params[fieldName] != newValue) {
							me.setValue('');
						}
					},

					setValue : function(value) {
						var me = this, selType = me.v3selection;

						if (value != me.v3CodeValue) {
							me.setRawValue(value);
							me.v3SetCodeValue(value);
							me.v3SetNameValue(null);
							me.v3dynamicObject = [];
						}

						if (Ext.isEmpty(value)) {
							me.v3remotevalid = '';
							me.setRawValue('');
							me.v3SetCodeValue('');
							me.v3SetNameValue(null);
							me.v3dynamicObject = [];

						}

						// 单选模式下，如果通过set方式输入的值进行校验，并显示需要显示的字段
						if (selType === 'SINGLE' && !Ext.isEmpty(value)) {
							me.validValueAndDisplay();
						}

						return me;
					},

					/*
					 * 用来设置field的显示内容
					 */
					setIValue : function(value) {
						var me = this;
						me.setRawValue(value);
						return me;
					},

					getValue : function() {
						return this.getRawValue();
					},

					getLabValue : function() {
						return this.v3InitNameValue();
					},

					onTriggerClick : function() {
						var me = this, store = Ext.getStore(me.v3id
								+ 'popStore');
						if (store) {
							me.v3params.objectId = me.refObjectId;
							Ext.apply(store.proxy.extraParams, me.v3params);

						}

						me.collapse();
						if (!me.readOnly && !me.disabled) {
							if (me.isExpanded) {
								me.collapse();
							} else {
								me.expand();
							}
						}
					}
				});

/* 批量处理显示窗口 */
Ext
		.define(
				'V3.control.view.ProgressWindow',
				{
					extend : 'Ext.window.Window',
					modal : true,
					width : 650,
					executeSuccess : false,/* 执行结束时设置为true，会调用当前window的processModalResult(refresh) */
					height : 370,
					title : '批量执行',
					onExecute : null,
					buttonText : '', /* 按钮名称 */
					data : [],
					flag : '0', /* 是否重试 0否1是 */
					store : '',
					beforeclose : function() {
						var me = this;
						if (me.executeSuccess) {
							var task = new Ext.util.DelayedTask(function() {
								g_v3.windowManager.processModalResult(
										'refresh', me.id);
							});
							task.delay(500);
						}
						return true;
					},
					beforeExecute : function(rowIndex) {
						var me = this;
						var store = me.store;
						var record = store.getAt(rowIndex);
						if (record == null)
							return;
						if (me.flag == 1) {
							record.set("result", "");
						}
						var id = record.get('id');
						// 取得进度条
						var pbar = Ext.getCmp(id + "progress");
						if (pbar != null) {
							pbar.wait({
								interval : 500,
								duration : 100000,
								increment : 15,
								text : '正在执行...',
								scope : this
							});
							// me.afterExecute(rowIndex, false, "执行失败");
							// 调用jz方法

						} else {

							// 执行完成
							Ext.getCmp('excute').setDisabled(false);
						}
					},
					afterExecute : function(rowIndex, success, message) {
						var me = this;
						var store = me.store;
						var record = store.getAt(rowIndex);

						if (success) {
							record.set("result", "成功:" + message);
						} else {

							record.set("result", "失败:" + message);
						}

					},
					initComponent : function() {
						var me = this;
						me.on('beforeclose', me.beforeclose, this);
						me.store = Ext.create('Ext.data.Store', {
							fields : [ 'id', 'content', 'progress', 'result' ],
							data : {
								'progress' : me.data
							},
							proxy : {
								type : 'memory',
								reader : {
									type : 'json',
									root : 'progress'
								}
							}
						});

						Ext
								.applyIf(
										me,
										{
											items : [ {
												xtype : 'gridpanel',
												height : 370,
												enableColumnHide : false,
												store : me.store,
												id : me.id + 'grid',

												viewConfig : {
													listeners : {
														itemcontextmenu : function(
																sender, record,
																item, index, e,
																eOpts) {
															e.stopEvent();

															if (!me.v3contextmenu) {
																me.v3contextmenu = Ext
																		.create(
																				'Ext.menu.Menu',
																				{
																					items : [
																							{
																								xtype : 'menuitem',
																								text : '查看结果',

																								listeners : {
																									click : {
																										fn : function(
																												item,
																												e,
																												eOpts) {

																											var grid = Ext
																													.getCmp(me.id
																															+ 'grid');
																											var records = grid
																													.getSelectionModel()
																													.getSelection();
																											if (records != null
																													&& records.length > 0) {
																												var result = records[0]
																														.get("result");

																												Ext.Msg
																														.show({
																															title : '提示',
																															msg : result,
																															buttons : Ext.Msg.OK
																														});
																											}
																										},
																										scope : me
																									}
																								}
																							},
																							{
																								xtype : 'menuitem',
																								text : '执行重试',
																								listeners : {
																									click : {
																										fn : function(
																												item,
																												e,
																												eOpts) {

																											var grid = Ext
																													.getCmp(me.id
																															+ 'grid');
																											var records = grid
																													.getSelectionModel()
																													.getSelection();
																											if (records != null
																													&& records.length > 0) {
																												var result = records[0]
																														.get("result");
																												if (result
																														.indexOf('失败') == 0) {
																													var row = grid.store
																															.indexOf(records[0]);
																													records[0]
																															.set(
																																	"result",
																																	"");
																													me
																															.onExecute(
																																	row,
																																	true);
																												} else {
																													Ext.Msg
																															.show({
																																icon : Ext.Msg.WARNING,
																																title : '提示',
																																msg : '只有失败的才能执行重试!',
																																buttons : Ext.Msg.OK
																															});
																												}

																											}
																										},
																										scope : me
																									}
																								}
																							} ]
																				});
															}
															me.v3contextmenu
																	.showAt(e
																			.getXY());

														}
													}
												},

												columns : [
														{
															xtype : 'gridcolumn',
															dataIndex : 'id',
															text : 'id',
															width : 100,
															hidden : true,
															sortable : false
														},
														{
															xtype : 'gridcolumn',
															dataIndex : 'content',
															text : '内容',
															width : 300,
															sortable : false
														},
														{
															xtype : 'gridcolumn',
															width : 130,
															dataIndex : 'progress',
															text : '进度',
															sortable : false,
															renderer : function(
																	value,
																	cellmeta,
																	record,
																	rowIndex,
																	columnIndex,
																	store) {
																var id = record
																		.get('id');
																var progressId = id
																		+ 'progress';
																Ext
																		.defer(
																				function() {
																					Ext
																							.widget(
																									'progressbar',
																									{
																										id : progressId,
																										renderTo : id,
																										text : '等待执行...',
																										cls : 'custom'
																									});
																				},
																				50);

																if (record
																		.get(
																				'result')
																		.indexOf(
																				'失败') == 0) {
																	return Ext.String
																			.format(
																					'<div align="center" style="display:none;"><img src='
																							+ g_v3.webcontext
																							+ '/resource/extjs/images/common/approve.gif></img></div>'
																							+ '<div align="center"><img src='
																							+ g_v3.webcontext
																							+ '/resource/extjs/images/common/close.gif></img></div>'
																							+ '<div style="display:none;" name:"progress" id="{0}"</div>',
																					id);
																} else if (record
																		.get(
																				'result')
																		.indexOf(
																				'成功') == 0) {
																	return Ext.String
																			.format(
																					'<div align="center"><img src='
																							+ g_v3.webcontext
																							+ '/resource/extjs/images/common/approve.gif></img></div>'
																							+ '<div align="center" style="display:none;"><img src='
																							+ g_v3.webcontext
																							+ '/resource/extjs/images/common/close.gif></img></div>'
																							+ '<div style="display:none;" name:"progress" id="{0}"</div>',
																					id);
																} else {
																	return Ext.String
																			.format(
																					'<div align="center" style="display:none;"><img src='
																							+ g_v3.webcontext
																							+ '/resource/extjs/images/common/approve.gif></img></div>'
																							+ '<div align="center" style="display:none;"><img src='
																							+ g_v3.webcontext
																							+ '/resource/extjs/images/common/close.gif></img></div>'
																							+ '<div name:"progress" id="{0}"</div>',
																					id);
																}
															}
														},
														{
															xtype : 'gridcolumn',
															dataIndex : 'result',
															text : '结果',
															sortable : false,
															flex : 1
														} ],
												dockedItems : [ {
													xtype : 'toolbar',
													dock : 'top',
													items : [
															{
																xtype : 'button',
																id : 'excute',
																text : '执行:'
																		+ this.buttonText,
																iconCls : 'approve',
																listeners : {
																	click : {
																		fn : function(
																				button,
																				e,
																				eOpts) {
																			me
																					.onExecute();

																			button
																					.setDisabled(true);
																		},
																		scope : this
																	}
																}
															},
															{
																xtype : 'button',
																text : '关闭',
																iconCls : 'close',
																listeners : {
																	click : {
																		fn : function(
																				button,
																				e,
																				eOpts) {
																			button
																					.up(
																							'window')
																					.close();
																		},
																		scope : this
																	}
																}
															} ]
												} ]
											} ]
										});

						me.callParent(arguments);
					}

				});

/*
 * 绑定编辑控件与dictable的定义
 */

Ext
		.override(
				Ext.form.Panel,
				{
					dicStore : {},
					operationStore : [],
					pickerStore : {},
					dicsearchid : null,
					dicSearchStore : {},
					buildDictables : function(operationids, dictables, items,
							pickerObjects) {
						if (!items || items.length == 0) {
							return;
						}

						for (var i = 0; i < items.length; i++) {
							var o = items[i];
							if (!o.xtype) {
								continue;
							}
							if (/* o.xtype == 'button' && */typeof o.v3operationid != 'undefined'
									&& !o.v3done) {

								if (!Ext.Array.contains(operationids,
										o.v3operationid)) {
									Ext.Array.push(operationids,
											o.v3operationid);
								}
								/* o.v3done = true; */
							}
							if (o.xtype == 'gridcolumn' && o.dictable
									&& !o.v3done) {
								if (!Ext.Array.contains(dictables, o.dictable)) {
									Ext.Array.push(dictables, o.dictable);
								}
								o.v3done = true;

							} else if (o.dictable /* && o.diccolumn */
									&& !o.v3done) {
								if (!Ext.Array.contains(dictables, o.dictable)) {
									Ext.Array.push(dictables, o.dictable);
								}
								o.v3done = true;
							} else if (o.dicdynamicobject && !o.v3done) {

								var defaultl2c = 'CODELABEL2CODE';
								if (typeof o.defaultl2c != 'undefined') {
									defaultl2c = o.defaultl2c;
								}
								var did = 'dynamic_' + o.dicdynamicobject + ";"
										+ defaultl2c;
								if (!Ext.Array.contains(pickerObjects, did)) {
									Ext.Array.push(pickerObjects, did);
								}
								o.v3done = true;

							} else if (o.dicstaticobject && !o.v3done) {

								var defaultl2c = 'CODELABEL2CODE';
								if (typeof o.defaultl2c != 'undefined') {
									defaultl2c = o.defaultl2c;
								}
								var did = 'static_' + o.dicstaticobject + ";"
										+ defaultl2c;
								if (!Ext.Array.contains(pickerObjects, did)) {
									Ext.Array.push(pickerObjects, did);
								}
								o.v3done = true;
							} else if ((o.xtype.indexOf("treepanel") == 0 || o.xtype
									.indexOf("gridpanel") == 0)
									&& o.columns && !o.v3done) {
								for (var j = 0; j < o.columns.length; j++) {
									var gridcolumn = o.columns[j];
									if (gridcolumn.dictable
									/* && gridcolumn.diccolumn */) {
										if (!Ext.Array.contains(dictables,
												gridcolumn.dictable)) {
											Ext.Array.push(dictables,
													gridcolumn.dictable);
										}
									} else if (gridcolumn.columns instanceof Array) {
										this.buildDictables(operationids,
												dictables, gridcolumn.columns,
												pickerObjects);

									} else if (gridcolumn.dicdynamicobject) {
										var defaultl2c = 'CODELABEL2CODE';
										if (typeof gridcolumn.defaultl2c != 'undefined') {
											defaultl2c = gridcolumn.defaultl2c;
										}
										var did = 'dynamic_'
												+ gridcolumn.dicdynamicobject
												+ ";" + defaultl2c;
										if (!Ext.Array.contains(pickerObjects,
												did)) {
											Ext.Array.push(pickerObjects, did);
										}
									} else if (gridcolumn.dicstaticobject) {

										var defaultl2c = 'CODELABEL2CODE';
										if (typeof gridcolumn.defaultl2c != 'undefined') {
											defaultl2c = gridcolumn.defaultl2c;
										}
										var did = 'static_'
												+ gridcolumn.dicstaticobject
												+ ";" + defaultl2c;
										if (!Ext.Array.contains(pickerObjects,
												did)) {
											Ext.Array.push(pickerObjects, did);
										}
									}
								}

								o.v3done = true;
							}

							if (o.items && o.items instanceof Array
									&& o.items.length > 0) {
								this.buildDictables(operationids, dictables,
										o.items, pickerObjects);
							}
							if (o.dockedItems && o.dockedItems instanceof Array
									&& o.dockedItems.length > 0) {
								this.buildDictables(operationids, dictables,
										o.dockedItems, pickerObjects);
							}

						}
					},
					parseValue : function(vstr, xtype) {
						if (xtype == "datefield") {
							return Ext.Date.parse(vstr, "Y-m-d");
						} else if (xtype == "timefield") {
							return Ext.Date.parse(vstr, "H:i:s");
						} else if (xtype == "datetimefield") {
							return Ext.Date.parse(vstr, "Y-m-d H:i:s");
						} else if (xtype == "numberfield") {
							return parseFloat(vstr);
						} else if (xtype == "checkboxfield") {
							return vstr == "1" || vstr == "true";
						}
						return vstr;
					},
					mappingProperties : function(o, column, otype) {
						if (o.xtype != "textareafield"
								&& o.xtype != 'htmleditor') {
							o.xtype = column.xtype;
						}

						o.v3fieldList = column.v3fieldList;
						o.v3columnList = column.v3columnList;
						o.v3resultcol = column.v3resultcol;
						o.v3labelcols = column.v3labelcols;
						o.v3selection = column.v3selection;

						if (typeof column.inputType != "undefined"
								&& otype == "form") {
							o.inputType = column.inputType;
						}
						if (otype == "form") {
							if (typeof column.fieldLabel != "undefined") {
								o.fieldLabel = column.fieldLabel;
							}
						}
						if (typeof o.readOnly == "undefined"
								&& typeof column.readOnly != "undefined") {
							o.readOnly = column.readOnly;
						}

						if (typeof column.hideTrigger != "undefined") {
							o.hideTrigger = column.hideTrigger;
						}
						if (typeof column.enableKeyEvents != "undefined") {
							o.enableKeyEvents = column.enableKeyEvents;
						}
						if (typeof o.editable == "undefined"
								&& typeof column.editable != "undefined") {
							o.editable = column.editable;
						}
						if (typeof column.allowBlank != "undefined") {
							o.allowBlank = column.allowBlank;
						}
						if (typeof column.defaultl2c != "undefined") {
							o.defaultl2c = column.defaultl2c;
						}

						o.msgTarget = 'title';
						if (o.allowBlank != undefined && !o.allowBlank) {
							o.blankText = column.blankText || o.blankText;
							if (otype == "form") {
								o.fieldLabel = "<font color=red>*</font>"
										+ o.fieldLabel;
							}
						}
						if (typeof o.readOnly != "undefined" && o.readOnly) {
							/*
							 * o.readOnlyCls = Ext.baseCSSPrefix +
							 * 'item-disabled';
							 */
							if (otype == "form") {
								o.fieldLabel = "<font color=blue>"
										+ o.fieldLabel + "</font>";
								/*
								 * o.fieldLabel='<span
								 * class="readonly-label">'+o.fieldLabel+'</span>';
								 */
							}
						}

						if (typeof column.maxValue != "undefined") {
							o.maxText = column.maxText;
							o.maxValue = this.parseValue(column.maxValue,
									o.xtype);

						}
						if (typeof column.minValue != "undefined") {
							o.minValue = this.parseValue(column.minValue,
									o.xtype);
							o.minText = column.minText;
						}

						if (typeof column.value != "undefined") {
							if (o.xtype == 'v3gridtriggerfield'
									|| o.xtype == 'v3treetriggerfield') {
								if (!o.id) {
									o.id = Ext.id();
								}
								var _v = column.value;
								var _id = o.id;
								var task = new Ext.util.DelayedTask(function() {
									var extO = Ext.getCmp(_id);
									if (extO.getValue() == null
											|| extO.getValue() == '') {
										extO.setValue(_v);
									}

								});
								task.delay(300);
							} else {
								if (column.xtype == 'checkboxfield') {
									o.checked = true == colum.value
											|| 'true' == column.value;
								} else {
									o.value = this.parseValue(column.value,
											o.xtype);
								}

							}
						}
						if (typeof o.searchConditionValue != "undefined") {
							if (o.xtype == 'v3gridtriggerfield'
									|| o.xtype == 'v3treetriggerfield') {

								if (!o.id) {
									o.id = Ext.id();
								}
								var _v = o.searchConditionValue;
								var _id = o.id;
								var task = new Ext.util.DelayedTask(function() {
									var extO = Ext.getCmp(_id);
									if (extO.getValue() == null
											|| extO.getValue() == '') {
										extO.setValue(_v);
									}
								});
								task.delay(300);
							} else {
								o.value = o.searchConditionValue;
							}

						}

						if (typeof column.maxLength != "undefined") {
							o.maxLength = column.maxLength;
							o.maxLengthText = column.maxLengthText;
						}
						if (typeof column.minLength != "undefined") {
							o.minLength = column.minLength;
							o.minLengthText = column.minLengthText;
						}
						if (typeof column.refObjectId != "undefined") {
							o.v3params = new Object();
							o.v3params.refObjectId = column.refObjectId;
							o.refObjectId = column.refObjectId;
							o.refObjectResult = column.refObjectResult;
						}
						if (typeof column.emptyText != "undefined") {
							o.emptyText = column.emptyText;
						}
						if (typeof column.format != "undefined") {

							o.format = column.format;
							o.altFormats = column.altFormats;

						}
						if (typeof column.allowDecimals != "undefined") {
							o.allowDecimals = column.allowDecimals;
						}
						if (typeof column.decimalPrecision != "undefined") {
							o.decimalPrecision = column.decimalPrecision;
						}
						if (typeof column.store != "undefined") {
							o.store = column.store;
						}
					},
					v3gridcontainercontextmenu : function(sender, e, eOpts) {
						e.stopEvent();
						sender.v3contextmenu.showAt(e.getXY());

					},
					v3griditemcontextmenu : function(sender, record, item,
							index, e, eOpts) {
						e.stopEvent();
						sender.v3contextmenu.showAt(e.getXY());

					},
					buildUrlAndRequestBody : function(item, grid, record,
							selColName) {
						var me = this;
						var url = item.url;
						var progresscaption = "";
						if (selColName) {
							url = url.replace("{_selectedcol}", selColName);
						}
						if (item.pathVariables) {
							var errormessage = "地址:" + url + "<br>参数:"
									+ Ext.encode(item.pathVariables);

							for ( var i in item.pathVariables) {
								var property = item.pathVariables[i];
								if (property.name == "_selectedcol") {
									continue;
								}

								var targetGrid = grid;
								var targetRecord = record;
								var targetPropertyName = property.name;

								if (property.masterProperty) {
									var store = Ext.getStore("store"
											+ grid.dicsearchdataset);
									if (!store.v3parentStore) {
										Ext.Msg.show({
											title : '错误信息',
											icon : Ext.Msg.WARNING,
											msg : '定义的功能需要提供主表参数：'
													+ property.masterProperty,
											buttons : Ext.Msg.OK
										});
										return {
											sucess : false
										};
									}
									var parentGrid = Ext.getCmp('grid'
											+ store.v3parentStore);
									var records = parentGrid
											.getSelectionModel().getSelection();
									if (records.length == 0) {
										Ext.Msg.show({
											title : '错误信息',
											icon : Ext.Msg.WARNING,
											msg : '请先选择一条主表数据',
											buttons : Ext.Msg.OK
										});
										return {
											sucess : false
										};
									}
									targetGrid = parentGrid;
									targetPropertyName = property.masterProperty;
									targetRecord = records[0];
								}

								var value = me.findBindingValueInModel(
										targetGrid, targetRecord,
										targetPropertyName, errormessage);
								if (value && value.error) {
									return {
										sucess : false
									};
								}
								if (url.indexOf("{" + property.name + "}") != -1) {
									progresscaption = progresscaption + value
											+ ' - ';
								}
								if (value == null) {
									url = url.replace(
											"{" + property.name + "}", "null");
								} else {
									value = new String(value);
									url = url.replace(
											"{" + property.name + "}",
											Ext.String.escape(value.toString())
													.replace("&", "%26"));
								}

							}
						}
						var prompts = [];
						if (item.requestParams) {
							var errormessage = "地址:" + url + "<br>参数:"
									+ Ext.encode(item.requestParams);

							for ( var i in item.requestParams) {
								var property = item.requestParams[i];
								if (property.name == "_selectedcol") {
									continue;
								}
								if (property.prompt !== undefined) {
									prompts.push(property.prompt);
									continue;
								}

								var targetGrid = grid;
								var targetRecord = record;
								var targetPropertyName = property.name;

								if (property.masterProperty) {
									var store = Ext.getStore("store"
											+ grid.dicsearchdataset);
									if (!store.v3parentStore) {
										Ext.Msg.show({
											title : '错误信息',
											icon : Ext.Msg.WARNING,
											msg : '定义的功能需要提供主表参数：'
													+ property.masterProperty,
											buttons : Ext.Msg.OK
										});
										return {
											sucess : false
										};
									}
									var parentGrid = Ext.getCmp('grid'
											+ store.v3parentStore);
									var records = parentGrid
											.getSelectionModel().getSelection();
									if (records.length == 0) {
										Ext.Msg.show({
											title : '错误信息',
											icon : Ext.Msg.WARNING,
											msg : '请先选择一条主表数据',
											buttons : Ext.Msg.OK
										});
										return {
											sucess : false
										};
									}
									targetGrid = parentGrid;
									targetPropertyName = property.masterProperty;
									targetRecord = records[0];
								}

								var value = me.findBindingValueInModel(
										targetGrid, targetRecord,
										targetPropertyName, errormessage);
								if (value && value.error) {
									return {
										sucess : false
									};
								}
								if (url.indexOf("?") == -1) {
									url = url + "?";
								}
								url = url
										+ property.name
										+ "="
										+ Ext.String.escape(value).replace("&",
												"%26") + "&";

								progresscaption = progresscaption + value
										+ ' - ';

							}
						}
						var body = null;
						if (item.requestBodyObject) {
							body = item.requestBodyObject;
						}
						if (item.modelAttributeObject) {
							body = item.modelAttributeObject;
						}

						if (body != null) {
							body = Ext.decode(Ext.encode(body));

							var errormessage = "地址:" + url + "<br>参数:"
									+ Ext.encode(body);

							for ( var property in body) {
								if (property == "_selectedcol") {
									continue;
								}

								if (Array.isArray(body[property])) {
									continue;
								}
								if (property == "id"
										&& (typeof body[property] == "object")) {
									var idobj = body[property];
									for ( var pp in idobj) {
										var value = me.findBindingValueInModel(
												grid, record, "id." + pp,
												errormessage);
										if (value && value.error) {
											return {
												sucess : false
											};
										}
										idobj[pp] = value;
										progresscaption = progresscaption
												+ " - " + value;
									}
								} else {
									var value = me.findBindingValueInModel(
											grid, record, property,
											errormessage);
									if (value && value.error) {
										return {
											sucess : false
										};
									}
									body[property] = value;
									progresscaption = progresscaption + value
											+ " - ";
								}

							}

						}
						if (selColName && body) {
							body["_selectedcol"] = selColName;
						}
						if (progresscaption.length > 1) {
							progresscaption = progresscaption.substring(0,
									progresscaption.length - 2);
						}

						var prompt = null;
						if (prompts.length > 0) {
							prompt = {
								name : prompts[0].name,
								required : prompts[0].required,
								title : prompts[0].title,
								message : prompts[0].message,
								emptyText : prompts[0].emptyText
							};
						}

						return {
							serviceUrl : url,
							requestBody : body,
							content : progresscaption,
							id : Ext.id(),
							prompt : prompt,
							sucess : true
						};

					},
					toSimilarProperty : function(property) {
						if (!property || property.length <= 2) {
							return property;
						}

						var str = property.substring(0, 1).toUpperCase()
								+ property.substring(1);
						var set = str.match(/[A-Z]+[a-z]*/g);

						var newstr = "";
						if (set) {
							for (var i = 0; i < set.length; i++) {
								newstr += set[i].toLowerCase();
								if (i != set.length - 1)
									newstr += '_';
							}

							return newstr;
						} else {
							return property;
						}

					},
					findBindingValueInModel : function(grid, model, property,
							errormessage) {
						var me = this;
						if (property.indexOf("id.") == 0) {
							for ( var i in model.fields) {
								var field = model.fields[i];
								if (field.mapping == property) {
									var r = model.get(field.name);
									if ((typeof r == "undefined" || r == null)
											&& r != "_selectedcol") {
										Ext.Msg
												.show({
													title : '提示',
													icon : Ext.Msg.ERROR,
													msg : '调用当前操作缺少参数：<br>'
															+ errormessage
															+ ',<br>请确认diccolumn或者model类中有此定义且有值！',
													buttons : Ext.Msg.OK
												});

										return {
											error : true
										};
									} else {
										return r;
									}
								}
							}

						}

						var field = model.fields.get(property);

						if (field == null) {
							field = model.fields.get(property.toLowerCase());
							if (field == null) {
								field = model.fields
										.get(property.toUpperCase());

							}

						}

						if (field != null) {
							var r = model.get(field.name);
							if ((typeof r == "undefined" || r == null)
									&& r != "_selectedcol") {
								Ext.Msg
										.show({
											title : '提示',
											icon : Ext.Msg.ERROR,
											msg : '调用当前操作缺少参数：<br>'
													+ errormessage
													+ ',<br>请确认diccolumn或者model类中有此定义且有值！',
											buttons : Ext.Msg.OK
										});

								return {
									error : true
								};
							} else {
								return r;
							}

						} else {
							var column = grid.down('[diccolumn=' + property
									+ ']');
							if (column == null) {
								var similarProperty = me
										.toSimilarProperty(property);
								column = grid.down('[diccolumn='
										+ similarProperty + ']');
								if (column == null) {
									column = grid.down('[diccolumn='
											+ similarProperty.toUpperCase()
											+ ']');
								}
							}
							if (column == null) {
								Ext.Msg
										.show({
											title : '提示',
											icon : Ext.Msg.ERROR,
											msg : '调用当前操作缺少参数：<br>'
													+ errormessage
													+ ',<br>请确认diccolumn或者model类中有此定义！',
											buttons : Ext.Msg.OK
										});
								return {
									error : true
								};
							}
							var r = model.get(column.dataIndex);
							if ((typeof r == "undefined" || r == null)
									&& r != "_selectedcol") {
								Ext.Msg
										.show({
											title : '提示',
											icon : Ext.Msg.ERROR,
											msg : '调用当前操作缺少参数：<br>'
													+ errormessage
													+ ',<br>请确认diccolumn或者model类中有此定义且有值！',
											buttons : Ext.Msg.OK
										});

								return {
									error : true
								};
							} else {
								return r;
							}
						}

					},
					v3gridContextInsertMenuClick : function(item, e, eOpts) {

						var me = this;
						var grid = Ext.getCmp(item.gridId);
						if (!grid.dicsearchdataset) {
							return;
						}
						if (!grid.v3insertable) {
							return;
						}

						var rowEditing = grid.getPlugin(grid.dicsearcdataset
								+ '_plugin');

						var store = Ext.getStore("store"
								+ grid.dicsearchdataset);
						if (rowEditing.editing) {
							return;
						}

						var box = Ext.Msg.wait('正在处理...', '请稍等');

						Ext.Ajax
								.request({
									url : grid.v3newmodelserviceurl,
									headers : {
										accept : 'application/json'
									},
									method : 'POST',
									scope : this,
									success : function(response, opts) {
										box.hide();
										var obj = Ext
												.decode(response.responseText);

										if (obj.result == 'SUCCESS') {

											var model = Ext.create(store.model,
													{});
											model.data = obj.returnObject;
											var master = null;
											if (store.v3parentStore != '') {
												var parentGrid = Ext
														.getCmp('grid'
																+ store.v3parentStore);
												var records = parentGrid
														.getSelectionModel()
														.getSelection();
												if (records.length == 0) {
													Ext.Msg.show({
														title : '错误信息',
														icon : Ext.Msg.WARNING,
														msg : '请先选择一条主表数据',
														buttons : Ext.Msg.OK
													});
													return;
												}

												master = records[0].data;
												for ( var p in model.data) {
													if (typeof master[p] != "undefined") {
														model.data[p] = master[p];
													}
												}

											}
											if (typeof grid.beforeinsert == "function") {
												if (!grid.beforeinsert(grid,
														model.data, master)) {
													return;
												}
												;

											}

											var records = store.add(model);
											rowEditing.startEdit(records[0], 1);
											grid.insertingRowId = records[0].id;/* 设置为新增状态 */
										} else {
											Ext.Msg.show({
												title : '错误信息',
												icon : Ext.Msg.WARNING,
												msg : obj.returnObject,
												buttons : Ext.Msg.CANCEL
											});
										}
									},
									failure : function(response, opts) {
										box.hide();
										Ext.Msg.show({
											title : '提示',
											msg : '网络连接失败',
											buttons : Ext.Msg.CANCEL
										});
									}
								});

					},
					v3gridContextDeleteMenuClick : function(item, e, eOpts) {

						var me = this;
						var grid = Ext.getCmp(item.gridId);
						if (!grid.dicsearchdataset) {
							return;
						}
						if (!grid.v3deleteable) {
							return;
						}

						var rowEditing = grid.getPlugin(grid.dicsearcdataset
								+ '_plugin');

						if (rowEditing.editing) {
							Ext.Msg.show({
								title : '错误信息',
								icon : Ext.Msg.WARNING,
								msg : '当前处于编辑状态，不能继续',
								buttons : Ext.Msg.OK
							});
							return;
						}

						var master = null;
						var store = Ext.getStore("store"
								+ grid.dicsearchdataset);
						if (store.v3parentStore != '') {
							var parentGrid = Ext.getCmp('grid'
									+ store.v3parentStore);
							var records = parentGrid.getSelectionModel()
									.getSelection();
							if (records.length == 0) {
								Ext.Msg.show({
									title : '错误信息',
									icon : Ext.Msg.WARNING,
									msg : '请先选择一条主表数据',
									buttons : Ext.Msg.OK
								});
								return;
							}

							master = records[0].data;
						}

						var records = grid.getSelectionModel().getSelection();

						if (records.length > 0) {
							var datas = [];
							for (var i = 0; i < records.length; i++) {
								datas.push(records[i].data);
							}

							if (typeof grid.beforedelete == 'function') {
								/* 自定义菜单事件返回false，则不处理 */
								if (grid.beforedelete(grid, datas, master) == false) {
									return;
								}
							}
							var box = Ext.Msg.wait('正在处理...', '请稍等');
							Ext.Ajax
									.request({
										url : grid.v3deleteserviceurl,
										headers : {
											accept : 'application/json'
										},
										method : 'POST',
										jsonData : datas,
										scope : this,
										success : function(response, opts) {
											var obj = Ext
													.decode(response.responseText);
											box.hide();
											if (obj.result == 'SUCCESS') {
												Ext.Msg
														.show({
															title : '提示信息',
															msg : obj.returnObject,
															buttons : Ext.Msg.OK,
															scope : this,
															fn : function() {
																Ext
																		.getStore(
																				"store"
																						+ grid.dicsearchdataset)
																		.remove(
																				records);
																grid
																		.getSelectionModel()
																		.select(
																				0);
															}
														});
											} else {
												Ext.Msg.show({
													title : '错误信息',
													icon : Ext.Msg.WARNING,
													msg : obj.returnObject,
													buttons : Ext.Msg.CANCEL
												});
											}
										},
										failure : function(response, opts) {
											box.hide();
											Ext.Msg.show({
												title : '提示',
												msg : '网络连接失败',
												buttons : Ext.Msg.CANCEL
											});
										}
									});

						}

					},
					v3gridContextExportExcelMenuClick : function(item, e, eOpts) {

						var me = this;
						var grid = Ext.getCmp(item.gridId);
						if (!grid.dicsearchdataset) {
							return;
						}
						if (grid.getSelectionModel().store.data.getCount() == 0) {
							Ext.Msg.show({
								title : '提示',
								icon : Ext.Msg.WARNING,
								msg : '没有数据',
								buttons : Ext.Msg.OK
							});

							return;
						}
						var controller = Ext.app.Application.instance
								.getController("main"), extraParams = grid
								.getStore().getProxy().extraParams, params = '';

						for ( var param in extraParams) {
							params = params + '&' + param + '='
									+ extraParams[param];
						}

						params = params.replace('&', '?');

						window.open(g_v3.webcontext + '/v3search/exportexcel/'
								+ controller.searchId + '/'
								+ grid.dicsearchdataset + '/' + params);

					},
					v3gridContextExportDBFMenuClick : function(item, e, eOpts) {

						var me = this;
						var grid = Ext.getCmp(item.gridId);
						if (!grid.dicsearchdataset) {
							return;
						}
						if (grid.getSelectionModel().store.data.getCount() == 0) {
							Ext.Msg.show({
								title : '提示',
								icon : Ext.Msg.WARNING,
								msg : '没有数据',
								buttons : Ext.Msg.OK
							});

							return;
						}
						var controller = Ext.app.Application.instance
								.getController("main");

						window.open(g_v3.webcontext + '/v3search/exportdbf/'
								+ controller.searchId + '/'
								+ grid.dicsearchdataset + '/');

					},
					v3gridContextCopyMenuClick : function(item, e, eOpts) {

						var me = this;
						var grid = Ext.getCmp(item.gridId);
						var records = grid.getSelectionModel().getSelection();
						if (records == null || records.length == 0) {
							Ext.Msg.show({
								title : '提示',
								icon : Ext.Msg.WARNING,
								msg : '没有选择数据',
								buttons : Ext.Msg.OK
							});
							return;
						}

					},
					v3gridContextPrintMenuClick : function(item, e, eOpts) {

						var me = this;
						var grid = Ext.getCmp(item.gridId);

						Ext.ux.grid.Printer.printAutomatically = false;
						Ext.ux.grid.Printer.print(grid)

					},
					v3gridContextLogMenuClick : function(item, e, eOpts) {

						var clientWindowId = g_v3.windowManager.showWindow(
								window.myWindowId, item.text, g_js.viewLogUrl,
								false, 900, 650);

					},

					v3gridContextClearCacheMenuClick : function(item, e, eOpts) {

						var clientWindowId = g_v3.windowManager.showWindow(
								window.myWindowId, item.text, g_v3.webcontext
										+ '/service/system/clearlocalcache/',
								false, 900, 650);

					},
					v3gridContextClearGProcClick : function(item, e, eOpts) {

						var clientWindowId = g_v3.windowManager.showWindow(
								window.myWindowId, item.text, g_v3.webcontext
										+ '/gservice/reload/', false, 900, 650);

					},

					v3gridContextSearctModifySearchMenuClick : function(item,
							e, eOpts) {
						var grid = Ext.getCmp(item.gridId);
						if (!grid.dicsearchdataset) {
							return;
						}
						var controller = Ext.app.Application.instance
								.getController("main");
						if (controller.v3dmModifySearchUrl) {
							var clientWindowId = g_v3.windowManager.showWindow(
									window.myWindowId, "查询设计",
									controller.v3dmModifySearchUrl, false,
									1024, 768);
							grid.clientWindowObj = grid.clientWindowObj || [];
							grid.clientWindowObj.push(clientWindowId);
						}

					},
					v3gridContextSearchColSetMenuClick : function(item, e,
							eOpts) {
						var me = this;
						var grid = Ext.getCmp(item.gridId);
						if (!grid.dicsearchdataset) {
							return;
						}

						var controller = Ext.app.Application.instance
								.getController("main");
						var searhcId = controller.searchId;
						var dataSetId = grid.dicsearchdataset
						// /system/saveSearchColSet/{searchId}/{dataSetId}/
						var surl = g_v3.webcontext
								+ '/service/system/saveSearchColSet/'
								+ controller.searchId + '/'
								+ grid.dicsearchdataset + '/';
						var colSet = [];
						for (var i = 0; i < grid.columns.length; i++) {
							var ocol = grid.columns[i];
							if (!ocol.dataIndex && ocol.items) {
								for (var ii = 0; ii < ocol.items.items.length; ii++) {
									var ocol1 = ocol.items.items[ii];
									var ncol = {};
									ncol.colId = ocol1.dataIndex;

									ncol.visible = !ocol1.hidden;
									ncol.width = ocol1.width;
									ncol.locked = ocol1.locked;
									if (!ncol.visible) {
										ncol.sno = 100 + colSet.length + 1;
									} else {
										ncol.sno = colSet.length + 1;
									}
									colSet.push(ncol);

								}
								continue;
							}
							var ncol = {};
							ncol.colId = ocol.dataIndex;

							ncol.visible = !ocol.hidden;
							ncol.width = ocol.width;
							ncol.locked = ocol.locked;
							if (!ncol.visible) {
								ncol.sno = 100 + colSet.length + 1;
							} else {
								ncol.sno = colSet.length + 1;
							}
							colSet.push(ncol);
						}
						var myMask = new Ext.LoadMask(Ext.getBody(), {
							msg : "正在保存列配置信息,请稍后...",
							msgCls : 'z-index:10000;'
						});
						myMask.show();

						Ext.Ajax
								.request({
									// async :
									// false,
									url : surl,
									headers : {
										accept : 'application/json',
										'Content-Type' : 'application/json'
									},

									jsonData : colSet,
									method : 'POST',
									scope : me,
									success : function(response, opts) {
										myMask.hide();
										var obj = Ext
												.decode(response.responseText);
										if (obj.result == 'SUCCESS') {
											Ext.Msg
													.show({
														title : '提示',
														icon : Ext.Msg.WARNING,
														msg : '保存成功,如果不是开发模式，需要清空缓存或者重启WAS才能生效',
														buttons : Ext.Msg.OK
													});
										} else {
											Ext.Msg.show({
												title : '错误',
												icon : Ext.Msg.WARNING,
												msg : obj.returnObject,
												buttons : Ext.Msg.OK
											});

										}
									},
									failure : function(response, opts) {
										myMask.hide();
										Ext.Msg.show({
											title : '',
											icon : Ext.Msg.WARNING,
											msg : '请求失败！',
											buttons : Ext.Msg.OK
										});
									}
								});

					},
					v3gridContextMenuitemClick : function(item, e, eOpts) {
						var me = this;
						var grid = Ext.getCmp(item.gridId);

						if (grid.dicsearchdataset) {

							if (!grid.clientWindowObj) {
								grid.clientWindowObj = [];
							}

						}
						var records = grid.getSelectionModel().getSelection();
						var position = grid.getSelectionModel()
								.getCurrentPosition();
						var selectedColName = "";
						if (position && position.columnHeader) {
							selectedColName = position.columnHeader.dataIndex;

						}

						if (typeof grid.onContextMenuClick == 'function') {
							/* 自定义菜单事件返回true，则不处理 */
							if (grid.onContextMenuClick(grid, records,
									position, item) == true) {
								return;
							}

						}

						var method = item.method;
						var action = item.action;

						if ((!item.masterProperty)
								&& ((item.pathVariables && item.pathVariables.length > 0)
										|| (item.pathVariables && item.pathVariables.length > 0)
										|| item.requestBodyObject || item.modelAttributeObject)
								&& (records == null || records.length == 0)) {
							Ext.Msg.show({
								title : '提示',
								icon : Ext.Msg.WARNING,
								msg : '请选择数据',
								buttons : Ext.Msg.OK
							});

							return;
						}

						if (action == "Page" && method == "GET") {
							var record = null;
							if (records != null && records.length > 0) {
								record = records[0];
							}
							var bo = me.buildUrlAndRequestBody(item, grid,
									record, selectedColName);
							if (bo.sucess) {
								var clientWindowId = g_v3.windowManager
										.showWindow(window.myWindowId,
												item.text, bo.serviceUrl,
												item.wModal, item.wWidth,
												item.wHeight);
								grid.clientWindowObj.push(clientWindowId);
							}

						} else if (action == "Service" && method == "GET") {
							var bos = [];
							for ( var i in records) {
								var record = records[i];

								var bo = me.buildUrlAndRequestBody(item, grid,
										record, selectedColName);
								if (!bo.sucess) {
									return;
								}
								bos.push(bo);
							}
							if (bos.length > 0) {
								var progresswindow = Ext
										.create(
												'V3.control.view.ProgressWindow',
												{

													data : bos,
													buttonText : item.text,
													executeSuccess : false,

													onExecute : function(
															rowindex, onetime) {

														if (!rowindex) {
															rowindex = 0;
														}
														var me = this;
														if (rowindex == me.data.length) {

															return;
														}
														var prompt = me.data[0].prompt;
														if (prompt !== null) {
															/*
															 * 执行前输入@prompt
															 * param
															 */
															if (prompt.value === undefined) {
																var doResult = function(
																		btn,
																		text) {
																	if (btn === 'ok') {
																		if (prompt.required === '1'
																				&& (text === '' || text === null)) {
																			Ext.Msg
																					.show({
																						title : '错误',
																						icon : Ext.Msg.WARNING,
																						msg : prompt.message
																								+ " 不能为空,请重新执行操作!",
																						buttons : Ext.Msg.OK
																					});
																			return;
																		}
																		me.data[0].prompt.value = text;
																		me
																				.onExecute(
																						rowindex,
																						onetime);
																		return;
																	} else {
																		return;
																	}
																};

																Ext.MessageBox
																		.prompt(
																				prompt.title,
																				prompt.message,
																				doResult,
																				this,
																				300);

																return;
															}

														}

														var url = g_v3.webcontext
																+ me.data[rowindex].serviceUrl;
														if (prompt !== null) {
															if (url
																	.indexOf("?") == -1) {
																url = url
																		+ "?"
																		+ prompt.name
																		+ "="
																		+ Ext.String
																				.escape(prompt.value);
															} else {
																url = url
																		+ "&"
																		+ prompt.name
																		+ "="
																		+ Ext.String
																				.escape(prompt.value);
															}
														}

														me
																.beforeExecute(rowindex);

														Ext.Ajax
																.request({
																	// async :
																	// false,
																	url : url,
																	headers : {
																		accept : 'application/json'
																	},

																	jsonData : me.data[rowindex].requestBody,
																	method : 'GET',
																	scope : me,
																	success : function(
																			response,
																			opts) {
																		me.executeSuccess = true;
																		var obj = Ext
																				.decode(response.responseText);
																		if (obj.result == 'SUCCESS') {

																			me
																					.afterExecute(
																							rowindex,
																							true,
																							obj.returnObject);
																			if (!onetime) {
																				me
																						.onExecute(rowindex + 1);
																			}
																		} else if (obj.result === 'PENDING') {
																			var jobId = obj.returnObject, flag = true, poll = setInterval(
																					function() {
																						if (flag) {
																							Ext.Ajax
																									.request({
																										url : g_v3.webcontext
																												+ '/service/asyncResult?jobId='
																												+ jobId,
																										headers : {
																											accept : 'application/json'
																										},
																										method : 'GET',
																										scope : me,
																										success : function(
																												response,
																												opts) {
																											var pendingObj = Ext
																													.decode(response.responseText);

																											if (pendingObj.result != 'PENDING') {
																												flag = false;
																												clearInterval(poll);
																												if (pendingObj.result === 'SUCCESS') {
																													me
																															.afterExecute(
																																	rowindex,
																																	true,
																																	pendingObj.returnObject);

																													if (!onetime) {
																														me
																																.onExecute(rowindex + 1);
																													}
																												} else {
																													me
																															.afterExecute(
																																	rowindex,
																																	false,
																																	pendingObj.returnObject);

																													if (!onetime) {
																														me
																																.onExecute(rowindex + 1);
																													}
																												}
																											}
																										},
																										failure : function(
																												response,
																												opts) {
																											flag = false;
																											clearInterval(poll);
																											me
																													.afterExecute(
																															rowindex,
																															false,
																															'网络连接失败');

																											if (!onetime) {
																												me
																														.onExecute(rowindex + 1);
																											}
																										}
																									});
																						} else {
																							clearInterval(poll);
																						}
																					},
																					10000);
																		} else {
																			me
																					.afterExecute(
																							rowindex,
																							false,
																							obj.returnObject);

																			if (!onetime) {
																				me
																						.onExecute(rowindex + 1);
																			}
																		}
																	},
																	failure : function(
																			response,
																			opts) {
																		me
																				.afterExecute(
																						rowindex,
																						false,
																						'网络连接失败');

																		if (!onetime) {
																			me
																					.onExecute(rowindex + 1);
																		}

																	}
																});

													}
												});
								grid.clientWindowObj.push(progresswindow.id);
								progresswindow.show();

							}

						} else if (action == "Service"
								&& (method == "POST" || method == "PUT" || method == "DELETE")) {
							var bos = [];
							for ( var i in records) {
								var record = records[i];

								var bo = me.buildUrlAndRequestBody(item, grid,
										record, selectedColName);
								if (!bo.sucess) {
									return;
								}
								bos.push(bo);
							}

							if (bos.length > 0) {
								if (item.objectIsV3List) {
									var newbodies = [];
									var ccontent = "";
									for ( var nn in bos) {
										newbodies.push(bos[nn].requestBody);
										ccontent = ccontent + bos[nn].content;
									}
									bos = [ {
										serviceUrl : bos[0].serviceUrl,
										requestBody : newbodies,
										content : ccontent,
										id : Ext.id(),
										sucess : true,
										prompt : bos[0].prompt
									} ];

								}
								var progresswindow = Ext
										.create(
												'V3.control.view.ProgressWindow',
												{
													data : bos,
													buttonText : item.text,

													onExecute : function(
															rowindex, onetime) {

														if (!rowindex) {
															rowindex = 0;
														}
														var me = this;
														if (rowindex == me.data.length) {
															return;
														}

														var prompt = me.data[0].prompt;
														if (prompt !== null) {
															/*
															 * 执行前输入@prompt
															 * param
															 */
															if (prompt.value === undefined) {
																var doResult = function(
																		btn,
																		text) {
																	if (btn === 'ok') {
																		me.data[0].prompt.value = text;
																		me
																				.onExecute(
																						rowindex,
																						onetime);
																		return;
																	} else {
																		return;
																	}
																};

																Ext.MessageBox
																		.prompt(
																				prompt.title,
																				prompt.message,
																				doResult,
																				this,
																				300);

																return;
															}

														}

														var url = g_v3.webcontext
																+ me.data[rowindex].serviceUrl;
														if (prompt !== null) {
															if (url
																	.indexOf("?") == -1) {
																url = url
																		+ "?"
																		+ prompt.name
																		+ "="
																		+ Ext.String
																				.escape(prompt.value);
															} else {
																url = url
																		+ "&"
																		+ prompt.name
																		+ "="
																		+ Ext.String
																				.escape(prompt.value);
															}
														}

														me
																.beforeExecute(rowindex);

														Ext.Ajax
																.request({
																	// async :
																	// false,
																	url : url,
																	headers : {
																		accept : 'application/json',
																		'Content-Type' : 'application/json'
																	},

																	jsonData : me.data[rowindex].requestBody,
																	method : 'POST',
																	scope : me,
																	success : function(
																			response,
																			opts) {
																		me.executeSuccess = true;
																		var obj = Ext
																				.decode(response.responseText);
																		if (obj.result == 'SUCCESS') {

																			me
																					.afterExecute(
																							rowindex,
																							true,
																							obj.returnObject);
																			if (!onetime) {
																				me
																						.onExecute(rowindex + 1);
																			}
																		} else if (obj.result === 'PENDING') {
																			var jobId = obj.returnObject, flag = true, poll = setInterval(
																					function() {
																						if (flag) {
																							Ext.Ajax
																									.request({
																										url : g_v3.webcontext
																												+ '/service/asyncResult?jobId='
																												+ jobId,
																										headers : {
																											accept : 'application/json'
																										},
																										method : 'GET',
																										scope : me,
																										success : function(
																												response,
																												opts) {
																											var pendingObj = Ext
																													.decode(response.responseText);

																											if (pendingObj.result != 'PENDING') {
																												flag = false;

																												if (pendingObj.result === 'SUCCESS') {
																													me
																															.afterExecute(
																																	rowindex,
																																	true,
																																	pendingObj.returnObject);

																													if (!onetime) {
																														me
																																.onExecute(rowindex + 1);
																													}
																												} else {
																													me
																															.afterExecute(
																																	rowindex,
																																	false,
																																	pendingObj.returnObject);

																													if (!onetime) {
																														me
																																.onExecute(rowindex + 1);
																													}
																												}
																											}
																										},
																										failure : function(
																												response,
																												opts) {
																											flag = false;

																											me
																													.afterExecute(
																															rowindex,
																															false,
																															'网络连接失败');

																											if (!onetime) {
																												me
																														.onExecute(rowindex + 1);
																											}
																										}
																									});
																						} else {
																							clearInterval(poll);
																						}
																					},
																					10000);
																		} else {
																			me
																					.afterExecute(
																							rowindex,
																							false,
																							obj.returnObject);

																			if (!onetime) {
																				me
																						.onExecute(rowindex + 1);
																			}
																		}
																	},
																	failure : function(
																			response,
																			opts) {
																		me
																				.afterExecute(
																						rowindex,
																						false,
																						'网络连接失败');

																		if (!onetime) {
																			me
																					.onExecute(rowindex + 1);
																		}

																	}
																});

													}
												});
								grid.clientWindowObj.push(progresswindow.id);
								progresswindow.show();

							}

						}
					},
					pathSearchItems : function(items, rootContainer) {
						var me = this;
						if (items == null) {
							return;
						}
						for (var i = 0; i < items.length; i++) {
							var o = items[i];
							if (!o.xtype) {
								continue;
							}
							if (o.xtype && !o.v3searchmapdone
									&& rootContainer.dicsearchid) {
								o.v3searchmapdone = true;
								if (o.xtype.indexOf("treepanel") == 0
										&& o.dicsearchdataset) {
									var gridcolumns = rootContainer.dicSearchStore[o.dicsearchdataset];
									if (!gridcolumns) {
										Ext.Msg.show({
											title : '错误信息',
											icon : Ext.Msg.WARNING,
											msg : '定义的查询数据集不存在：'
													+ o.dicsearchdatase,
											buttons : Ext.Msg.CANCEL
										});
										continue;
									}
									o.columns = gridcolumns;
									o.store = 'store' + o.dicsearchdataset;
									o.id = 'grid' + o.dicsearchdataset;

									o.title = rootContainer.dicSearchStore[o.dicsearchdataset
											+ ".title"];
									o.collapsible = false;
									o.useArrows = true;
									o.multiSelect = true;
									/* o.singleExpand = true; */

								} else if (o.xtype.indexOf("mzpivotgrid") == 0
										&& o.dicsearchdataset) {
									 
									var pivotDefine = rootContainer.dicSearchStore[o.dicsearchdataset];
									if (!pivotDefine) {
										Ext.Msg.show({
											title : '错误信息',
											icon : Ext.Msg.WARNING,
											msg : '定义的查询数据集不存在：'
													+ o.dicsearchdatase,
											buttons : Ext.Msg.CANCEL
										});
										continue;
									}
									o.store = 'store' + o.dicsearchdataset;
									o.id = 'grid' + o.dicsearchdataset;
									var id = o.id;
									o.title = rootContainer.dicSearchStore[o.dicsearchdataset
											+ ".title"];
									o.leftAxis = pivotDefine.leftAxis;
									o.topAxis = pivotDefine.topAxis;
									o.aggregate = pivotDefine.aggregate;
									for(var i in  o.aggregate){
										var agg = o.aggregate[i];
										if (typeof agg.v3ColRender != "undefined") {
											agg.renderer = eval(agg.v3ColRender);
											delete agg.v3ColRender;
										}
									}
									//o.enableLocking = true;
									 
									if( typeof o.rowSubTotalsPosition=='undefined'){
										o.rowSubTotalsPosition='last';	
									}
									if( typeof o.colSubTotalsPosition=='undefined'){
										o.colSubTotalsPosition='none';	
									}
									if( typeof o.colGrandTotalsPosition=='undefined'){
										o.colGrandTotalsPosition='none';	
									}
									
									o.excelExport=Ext
									.create(
											'Mz.pivot.plugin.ExcelExport',
											{
												config : {
													title : 'Report'
												// headerFillColor:
												// '#A5E2F6',
												// cellFillColor:
												// '#E4E4F4',
												// fontSize:
												// '12',
												// headerFontSize:
												// '14',
												// hasDefaultStyle:
												// true,
												// dateFormat:
												// 'Long Date',
												// numberFormat:
												// '#0.00'
												}
											});
									if (typeof o.plugins =='undefined'){
										o.plugins = [
											Ext
													.create('Mz.pivot.plugin.DrillDown'),
											Ext.create('Mz.pivot.plugin.Configurator'),
											o.excelExport
											 ];
									} 
									
									o.viewConfig = {
										trackOver : true,
										stripeRows : true
									};

									o.tbar = [ {
										xtype : 'button',
										text : '展开纬度',
										handler : function() {
											Ext.getCmp('grid' + o.dicsearchdataset).expandAll();
										}
									}, {
										xtype : 'button',
										text : '收起纬度',
										handler : function() {
											Ext.getCmp('grid' + o.dicsearchdataset).collapseAll();
										}
									}, {
										xtype : 'button',
										text : '另存为Excel(当前显示的)',
										handler : function() {
											  var f =Ext.getCmp('grid' + o.dicsearchdataset).excelExport.getExcelData(true);
											  document.location =
											 'data:application/vnd.ms-excel;base64,'
											  + Base64.encode(f);
										}
									}, {
										xtype : 'button',
										text : '另存为Excel(所有数据)',
										handler : function() {
											  var f = Ext.getCmp('grid' + o.dicsearchdataset).excelExport.getExcelData(false);
											  if(!Ext.isEmpty(f)){
											  document.location =
											  'data:application/vnd.ms-excel;base64,'
											 + Base64.encode(f);
											  }
										}
									} ];

								} else if (o.xtype.indexOf("gridpanel") == 0
										&& o.dicsearchdataset) {
									var gridcolumns = rootContainer.dicSearchStore[o.dicsearchdataset];
									if (!gridcolumns) {
										Ext.Msg.show({
											title : '错误信息',
											icon : Ext.Msg.WARNING,
											msg : '定义的查询数据集不存在：'
													+ o.dicsearchdatase,
											buttons : Ext.Msg.CANCEL
										});
										continue;
									}
									o.columns = gridcolumns;
									for ( var ii in o.columns) {
										if (typeof o.columns[ii].v3ColRender != "undefined") {
											o.columns[ii].renderer = eval(o.columns[ii].v3ColRender);
										}
										if (typeof o.columns[ii].v3SummaryRenderer != "undefined") {
											o.columns[ii].summaryRenderer = eval(o.columns[ii].v3SummaryRenderer);
										}
									}
									o.store = 'store' + o.dicsearchdataset;
									o.id = 'grid' + o.dicsearchdataset;
									var id = o.id;
									o.title = rootContainer.dicSearchStore[o.dicsearchdataset
											+ ".title"];
									var selmode = rootContainer.dicSearchStore[o.dicsearchdataset
											+ ".selModel"];

									if (!o.plugins) {
										o.plugins = [];
									}
									/*
									 * o.plugins .push(new
									 * Ext.grid.plugin.CellEditing( {
									 * clicksToEdit : 2 }));
									 */
									if (typeof selmode != 'undefined') {
										if (selmode == "cellmode") {
											o.selModel = {
												selType : 'cellmodel'
											};

										} else {
											o.selModel = Ext
													.create('Ext.selection.CheckboxModel');
										}

									}

									o.stateful = true;
									o.stateId = 'state.grid'
											+ o.dicsearchdataset;
									var summaryFeatures = rootContainer.dicSearchStore[o.dicsearchdataset
											+ ".features"];
									o.v3dictoperation = rootContainer.dicSearchStore[o.dicsearchdataset
											+ ".dictoperation"];
									if (!o.features) {
										o.features = [];
									}

									if (summaryFeatures) {
										o.features.push(summaryFeatures);
										if (summaryFeatures.ftype == "groupingsummary") {
											o.features.push({
												dock : "bottom",
												ftype : "ux.remotesummary",
												remoteRoot : "summary"
											});
										}

									}

									o.columnLines = true;
									o.features.push({
										ftype : 'filters',
										encode : true,
										local : true
									});

									var pagesize = rootContainer.dicSearchStore[o.dicsearchdataset
											+ ".pagesize"];

									if (pagesize != 99999) {
										if (!o.dockedItems) {
											o.dockedItems = [];
										}
										o.dockedItems.push({
											xtype : 'pagingtoolbar',
											dock : 'bottom',
											displayInfo : true,
											store : 'store'
													+ o.dicsearchdataset,
											plugins : Ext.create(
													'Ext.ux.SlidingPager', {})
										});
									}

									var editable = rootContainer.dicSearchStore[o.dicsearchdataset
											+ ".editable"];
									var insertable = rootContainer.dicSearchStore[o.dicsearchdataset
											+ ".insertable"];
									var deleteable = rootContainer.dicSearchStore[o.dicsearchdataset
											+ ".deleteable"];
									var saveServiceUrl = rootContainer.dicSearchStore[o.dicsearchdataset
											+ ".saveserviceurl"];
									var newmodelserviceurl = rootContainer.dicSearchStore[o.dicsearchdataset
											+ ".newmodelserviceurl"];

									var deleteServiceUrl = rootContainer.dicSearchStore[o.dicsearchdataset
											+ ".deleteserviceurl"];
									o.v3editable = editable;
									o.v3insertable = insertable;
									o.v3deleteable = deleteable;
									o.v3saveserviceurl = saveServiceUrl;
									o.v3deleteserviceurl = deleteServiceUrl;
									o.v3newmodelserviceurl = newmodelserviceurl;

									if (editable || insertable) {
										if (!o.plugins) {
											o.plugins = [];
										}
										o.plugins
												.push(Ext
														.create(
																'Ext.grid.plugin.RowEditing',
																{
																	pluginId : o.dicsearcdataset
																			+ '_plugin',
																	saveBtnText : '保存',
																	cancelBtnText : '取消',
																	errorsText : '',
																	msgTarget : 'title',
																	listeners : {
																		beforeedit : {
																			fn : function(
																					plugin,
																					context) {
																				var grid = context.grid;
																				var saveObj = context.record.data;
																				if (grid.insertingRowId != null
																						&& grid.insertingRowId != context.record.id) {
																					/* 新增状态调到其他行 */
																					return false;

																				}

																				if (typeof grid.beforeedit == 'function') {
																					/* 自定义菜单事件返回true，则不处理 */
																					return grid
																							.beforeedit(
																									grid,
																									saveObj);

																				}
																				return true;
																			}

																		},
																		validateedit : {
																			fn : function(
																					plugin,
																					context) {
																				var grid = context.grid;
																				var saveObj = context.record.data;
																				if (typeof grid.validateedit == 'function') {
																					/* 自定义菜单事件返回true，则不处理 */
																					if (grid
																							.validateedit(
																									grid,
																									saveObj) == false) {
																						return;
																					}
																				}
																			}

																		},
																		canceledit : {
																			fn : function(
																					plugin,
																					context) {
																				var grid = context.grid;
																				var saveObj = context.record.data;
																				if (grid.insertingRowId == context.record.id) {
																					grid.insertingRowId = null;
																					Ext
																							.getStore(
																									"store"
																											+ grid.dicsearchdataset)
																							.remove(
																									[ context.record ]);

																				}
																				if (typeof grid.canceledit == 'function') {
																					/* 自定义菜单事件返回true，则不处理 */
																					if (grid
																							.canceledit(
																									grid,
																									saveObj) == false) {
																						return;
																					}
																				}
																			}

																		},
																		edit : {
																			fn : function(
																					plugin,
																					context) {
																				var saveObj = context.record.data;
																				var box = Ext.Msg
																						.wait(
																								'正在保存...',
																								'请稍等');
																				var grid = context.grid;
																				if (typeof grid.save == 'function') {
																					/* 自定义菜单事件返回true，则不处理 */
																					if (grid
																							.save(
																									grid,
																									saveObj) == false) {
																						// context.record
																						// .cancelEdit();
																						return;
																					}
																				}
																				if (grid
																						.getStore('store'
																								+ o.dicsearcdataset).v3parentStore != '') {
																					var parentGrid = Ext
																							.getCmp('grid'
																									+ grid
																											.getStore('store'
																													+ o.dicsearcdataset).v3parentStore);
																					var records = parentGrid
																							.getSelectionModel()
																							.getSelection();
																					if (records.length == 0) {
																						Ext.Msg
																								.show({
																									title : '错误信息',
																									icon : Ext.Msg.WARNING,
																									msg : '请先选择一条主表数据',
																									buttons : Ext.Msg.OK
																								});
																						return;
																					}

																					var master = records[0].data;
																					for ( var p in saveObj) {
																						if (typeof master[p] != "undefined") {
																							saveObj[p] = master[p];
																						}
																					}

																				}

																				Ext.Ajax
																						.request({
																							// async
																							// :
																							// false,
																							url : grid.v3saveserviceurl,
																							headers : {
																								accept : 'application/json',
																								'Content-Type' : 'application/json'
																							},

																							jsonData : saveObj,
																							method : 'POST',
																							scope : me,
																							success : function(
																									response,
																									opts) {
																								box
																										.hide();
																								var obj = Ext
																										.decode(response.responseText);
																								if (obj.result == 'SUCCESS') {
																									grid.insertingRowId = null;
																									context.record
																											.commit();

																									Ext.Msg
																											.show({
																												title : '提示信息',
																												msg : obj.returnObject,
																												buttons : Ext.Msg.OK,
																												scope : this,
																												fn : function() {
																													grid.view
																															.focus();
																												}
																											});
																								} else {

																									Ext.Msg
																											.show({
																												title : '错误信息',
																												icon : Ext.Msg.WARNING,
																												msg : obj.returnObject,
																												buttons : Ext.Msg.OK,
																												fn : function() {
																													plugin
																															.startEdit(
																																	context.record,
																																	1);
																												}
																											});
																								}
																							},
																							failure : function(
																									response,
																									opts) {
																								box
																										.hide();

																								Ext.Msg
																										.show({
																											title : '提示',
																											msg : '网络连接失败',
																											buttons : Ext.Msg.OK,
																											fn : function() {
																												plugin
																														.startEdit(
																																context.record,
																																1);
																											}

																										});

																							}
																						});
																			},
																			scope : this
																		}
																	}
																}));

									}
									/* alert(Ext.encode(o)); */

								} else if ((o.xtype == "textfield"
										|| o.xtype == "datefield"
										|| o.xtype == "checkboxfield"
										|| o.xtype == "timefield"
										|| o.xtype == "triggerfield"
										|| o.xtype == "combobox" || o.xtype == "numberfield")
										&& o.dicsearchcondition) {

									var cons = rootContainer.dicSearchStore["v3ConditionDefine1978"];
									var con = cons[o.dicsearchcondition];
									if (!con) {
										Ext.Msg.show({
											title : '错误信息',
											icon : Ext.Msg.WARNING,
											msg : '定义的查询条件不存在：'
													+ o.dicsearchcondition,
											buttons : Ext.Msg.CANCEL
										});
										continue;
									}
									for ( var p in con) {
										o[p] = con[p];
									}
									o.msgTarget = 'title';

								}
								var toitems = null;
								if (o.items && o.items instanceof Array
										&& o.items.length > 0) {
									toitems = o.items;
								} else {
									toitems = o.dockedItems;
								}

								if (toitems != null && toitems instanceof Array) {
									this
											.pathSearchItems(toitems,
													rootContainer);

								}
							}

						}

					},
					pathItems : function(items, rootContainer) {
						var me = this;
						if (typeof items == "undefined" || items == null) {
							return;
						}

						for (var i = 0; i < items.length; i++) {
							var o = items[i];

							if (o.xtype) {
								if (/* o.xtype == 'button' && */typeof o.v3operationid != "undefined"
										&& !o.v3mapdone) {

									var found = false;
									for ( var i in me.operationStore) {
										if (me.operationStore[i] == o.v3operationid) {
											found = true;
											break;
										}
									}
									o.hidden = !found;
									o.hasV3Operation = found;
									if (o.xtype == "textfield"
											|| o.xtype == "datefield"
											|| o.xtype == "checkboxfield"
											|| o.xtype == "timefield"
											|| o.xtype == "triggerfield"
											|| o.xtype == "combobox"
											|| o.xtype == "hiddenfield"
											|| o.xtype == "numberfield"
											|| o.xtype == "textareafield"
											|| o.xtype == "htmleditor") {
										o.v3mapdone = false;
									} else {
										o.v3mapdone = true;
									}

								}
								if ((o.xtype.indexOf("treepanel") == 0 || o.xtype
										.indexOf("gridpanel") == 0)
										&& o.columns && !o.v3mapdone) {
									/* begin */
									o.v3mapdone = true;
									if (typeof o.viewConfig == "undefined") {
										o.viewConfig = {};
										o.viewConfig.listeners = {};
									}

									var griddictables = [];

									for (var j = 0; j < o.columns.length; j++) {
										var gridcolumn = o.columns[j];
										if (gridcolumn.dictable
										/* && gridcolumn.diccolumn */) {

											if (griddictables[gridcolumn.dictable]) {

												continue;
											}
											griddictables[gridcolumn.dictable] = gridcolumn.dictable;

										} else if (gridcolumn.columns instanceof Array) {
											for (var j = 0; j < o.columns.length; j++) {
												var gridcolumn = o.columns[j];
												if (gridcolumn.dictable
												/* && gridcolumn.diccolumn */) {

													if (griddictables[gridcolumn.dictable]) {

														continue;
													}
													griddictables[gridcolumn.dictable] = gridcolumn.dictable;
												}
											}
										}
									}

									var dictables = [];
									for ( var p in griddictables) {
										dictables.push(griddictables[p]);
									}

									if (dictables.length > 0
											&& (typeof o.hidev3menu == 'undefined')) {
										var _dsdId = 'null';
										if (o.dicsearchdataset) {
											_dsdId = o.dicsearchdataset;
										}
										var _searchid = 'null';
										if (window.v3dicsearchid) {
											_searchid = window.v3dicsearchid;
										}

										Ext.Ajax
												.request({
													async : false,
													url : g_v3.webcontext
															+ '/service/system/dictmenu/'
															+ _searchid + '/'
															+ _dsdId + '/',
													headers : {
														accept : 'application/json',
														'Content-Type' : 'application/json'
													},
													jsonData : dictables,
													method : 'POST',
													scope : this,
													success : function(
															response, opts) {
														var obj = Ext
																.decode(response.responseText);

														if (obj.result === 'SUCCESS') {
															var menuconfig = [];
															var superRights = obj.returnTag;

															for ( var i in obj.returnObject) {
																var menu = obj.returnObject[i];

																var menuitem = {};
																menuitem.xtype = 'menuitem';
																menuitem.text = menu.name;
																menuitem.width = 130;
																if (menu.menuItems
																		&& menu.menuItems.length > 0) {
																	menuitem.menu = {
																		xtype : 'menu',
																		width : 120,
																		items : []
																	};
																	for ( var kk in menu.menuItems) {
																		var submenu = menu.menuItems[kk];
																		var submenuitem = {};
																		submenuitem.xtype = 'menuitem';
																		submenuitem.text = submenu.name;
																		submenuitem.width = 130;
																		submenuitem.method = submenu.method;
																		submenuitem.url = submenu.url;
																		submenuitem.gridId = o.id;
																		submenuitem.icon = submenu.icon;

																		submenuitem.action = submenu.action;
																		submenuitem.objectIsV3List = submenu.objectIsV3List;

																		submenuitem.wWidth = submenu.width;
																		submenuitem.wHeight = submenu.height;
																		submenuitem.wModal = submenu.modal;

																		if (submenu.requestBodyObject) {
																			for ( var p in submenu.requestBodyObject) {
																				if (p == "id") {
																					continue;
																				}
																				submenu.requestBodyObject[p] = '';
																			}
																		}
																		if (submenu.modelAttributeObject) {
																			for ( var p in submenu.modelAttributeObject) {
																				if (p == "id") {
																					continue;
																				}
																				submenu.modelAttributeObject[p] = '';
																			}
																		}
																		submenuitem.requestBodyObject = submenu.requestBodyObject;
																		submenuitem.modelAttributeObject = submenu.modelAttributeObject;
																		submenuitem.masterProperty = submenu.masterProperty;
																		submenuitem.requestParams = submenu.requestParams;
																		submenuitem.pathVariables = submenu.pathVariables;
																		submenuitem.listeners = {
																			click : {
																				fn : me.v3gridContextMenuitemClick,
																				scope : me
																			}
																		};
																		menuitem.menu.items
																				.push(submenuitem);

																	}
																}
																menuconfig
																		.push(menuitem);

															}

															if (o.v3insertable
																	|| o.v3deleteable) {
																var menuitem = {};
																menuitem.xtype = 'menuitem';
																menuitem.text = '明细数据';
																menuitem.width = 130;
																menuitem.menu = {
																	xtype : 'menu',
																	width : 120,
																	items : []
																};
																menuconfig
																		.push('-');
																menuconfig
																		.push(menuitem);
																if (o.v3insertable) {
																	var insertmenu = {};
																	insertmenu.xtype = 'menuitem';
																	insertmenu.text = '新增一行';
																	insertmenu.width = 130;
																	insertmenu.gridId = o.id;
																	insertmenu.icon = g_v3.webcontext
																			+ "/resource/v3image/button/small/18_addView.gif";

																	insertmenu.listeners = {
																		click : {
																			fn : me.v3gridContextInsertMenuClick,
																			scope : me
																		}
																	};
																	menuitem.menu.items
																			.push(insertmenu);

																}
																if (o.v3deleteable) {
																	var deletemenu = {};
																	deletemenu.xtype = 'menuitem';
																	deletemenu.text = '删除一行';
																	deletemenu.width = 130;
																	deletemenu.gridId = o.id;

																	deletemenu.icon = g_v3.webcontext
																			+ "/resource/v3image/button/small/Application-del.png";

																	deletemenu.listeners = {
																		click : {
																			fn : me.v3gridContextDeleteMenuClick,
																			scope : me
																		}
																	};

																	menuitem.menu.items
																			.push(deletemenu);

																}
															}

															menuconfig
																	.push('-');
															var copyMenu = {};
															copyMenu.xtype = 'menuitem';
															copyMenu.text = '复制...';
															copyMenu.width = 130;
															copyMenu.gridId = o.id;
															copyMenu.icon = g_v3.webcontext
																	+ "/resource/v3image/button/small/Copy.png";

															copyMenu.listeners = {
																click : {
																	fn : me.v3gridContextCopyMenuClick,
																	scope : me
																}
															};

															menuconfig
																	.push(copyMenu);
															var printmenu = {};
															printmenu.xtype = 'menuitem';
															printmenu.text = '本地打印';
															printmenu.width = 130;
															printmenu.gridId = o.id;
															printmenu.icon = g_v3.webcontext
																	+ "/resource/v3image/button/small/16_print.gif";

															printmenu.listeners = {
																click : {
																	fn : me.v3gridContextPrintMenuClick,
																	scope : me
																}
															};

															menuconfig
																	.push(printmenu);

															var exportmenu = {};
															exportmenu.xtype = 'menuitem';
															exportmenu.text = '另存为';
															exportmenu.width = 130;
															exportmenu.icon = g_v3.webcontext
																	+ "/resource/v3image/button/small/Folder-Open.png";
															exportmenu.menu = {
																xtype : 'menu',
																width : 120,
																items : []
															};

															var exportExcelmenu = {};
															exportExcelmenu.xtype = 'menuitem';
															exportExcelmenu.text = 'Excel';
															exportExcelmenu.width = 130;
															exportExcelmenu.gridId = o.id;
															exportExcelmenu.icon = g_v3.webcontext
																	+ "/resource/v3image/button/small/16_excel.gif";

															exportExcelmenu.listeners = {
																click : {
																	fn : me.v3gridContextExportExcelMenuClick,
																	scope : me
																}
															};

															exportmenu.menu.items
																	.push(exportExcelmenu);

															var exportdbfmenu = {};
															exportdbfmenu.xtype = 'menuitem';
															exportdbfmenu.text = 'DBF';
															exportdbfmenu.width = 130;
															exportdbfmenu.gridId = o.id;
															exportdbfmenu.icon = g_v3.webcontext
																	+ "/resource/v3image/button/small/ico_16_exportCustomizations.gif";

															exportdbfmenu.listeners = {
																click : {
																	fn : me.v3gridContextExportDBFMenuClick,
																	scope : me
																}
															};
															exportmenu.menu.items
																	.push(exportdbfmenu);
															menuconfig
																	.push(exportmenu);

															if (superRights) {
																var logmenu = {};
																logmenu.xtype = 'menuitem';
																logmenu.text = '错误日志';
																logmenu.width = 130;
																logmenu.gridId = o.id;
																logmenu.icon = g_v3.webcontext
																		+ "/resource/v3image/button/small/Web-warn.png";
																logmenu.listeners = {
																	click : {
																		fn : me.v3gridContextLogMenuClick,
																		scope : me
																	}
																};
																menuconfig
																		.push(logmenu);
																if (superRights.mgproc == '1'
																		|| superRights.mstatic == '1'
																		|| superRights.mpermisson == '1'
																		|| superRights.mmodule == '1'
																		|| superRights.mdict == '1'
																		|| superRights.mdynamic == '1') {
																	var clearcache = {};
																	clearcache.xtype = 'menuitem';
																	clearcache.text = '清空V3DM缓存';
																	clearcache.width = 130;
																	clearcache.gridId = o.id;
																	clearcache.icon = g_v3.webcontext
																			+ "/resource/v3image/button/small/Web-warn.png";
																	clearcache.listeners = {
																		click : {
																			fn : me.v3gridContextClearCacheMenuClick,
																			scope : me
																		}
																	};
																	menuconfig
																			.push(clearcache);
																}
																if (superRights.mgproc == '1') {
																	var refreshGProc = {};
																	refreshGProc.xtype = 'menuitem';
																	refreshGProc.text = '重新编译GProc';
																	refreshGProc.width = 130;
																	refreshGProc.gridId = o.id;
																	refreshGProc.icon = g_v3.webcontext
																			+ "/resource/v3image/button/small/Web-warn.png";
																	refreshGProc.listeners = {
																		click : {
																			fn : me.v3gridContextClearGProcClick,
																			scope : me
																		}
																	};
																	menuconfig
																			.push(refreshGProc);
																}

																if (superRights.msearch == '1') {
																	var logmenu = {};
																	logmenu.xtype = 'menuitem';
																	logmenu.text = '保存列定义';
																	logmenu.width = 130;
																	logmenu.gridId = o.id;
																	logmenu.icon = g_v3.webcontext
																			+ "/resource/v3image/button/small/16_L_saveOpen.gif";
																	logmenu.listeners = {
																		click : {
																			fn : me.v3gridContextSearchColSetMenuClick,
																			scope : me
																		}
																	};

																	menuconfig
																			.push(logmenu);

																	var editsearchmenu = {};
																	editsearchmenu.xtype = 'menuitem';
																	editsearchmenu.text = '模块设计';
																	editsearchmenu.width = 130;
																	editsearchmenu.gridId = o.id;
																	editsearchmenu.icon = g_v3.webcontext
																			+ "/resource/v3image/button/small/ico_16_customAttributeMap.gif";
																	editsearchmenu.listeners = {
																		click : {
																			fn : me.v3gridContextSearctModifySearchMenuClick,
																			scope : me
																		}
																	};

																	menuconfig
																			.push(editsearchmenu);
																	// https://www.tzit.cn/v3dm/manage/searchdesigner/com.tzit.v3.apps.hwo2o.site.SiteApplication/fb9a9637fe544cca8f7ed8140ee31112/94168a44a5974e3d9b9fc55f612b97e3/
																}
															}

															o.viewConfig.v3contextmenu = Ext
																	.create(
																			'Ext.menu.Menu',
																			{
																				items : menuconfig
																			});
															if (!o.viewConfig.listeners) {
																o.viewConfig.listeners = {};
															}
															o.viewConfig.listeners.itemcontextmenu = me.v3griditemcontextmenu;
															o.viewConfig.listeners.containercontextmenu = me.v3gridcontainercontextmenu;
														} else {
															Ext.Msg
																	.show({
																		title : '错误信息',
																		icon : Ext.Msg.WARNING,
																		msg : obj.returnObject,
																		buttons : Ext.Msg.CANCEL
																	});
														}
													},
													failure : function(
															response, opts) {
														Ext.Msg
																.show({
																	title : '提示',
																	msg : '网络连接失败',
																	buttons : Ext.Msg.CANCEL
																});
													}
												});

									}

									if (!o.viewConfig) {
										o.viewConfig = {};
									}
									if (!o.viewConfig.v3contextmenu/*
																	 * &&(typeof
																	 * o.hidev3menu=='undefined')
																	 */) {

										var menuconfig = [];
										var copyMenu = {};
										copyMenu.xtype = 'menuitem';
										copyMenu.text = '复制...';
										copyMenu.width = 130;
										copyMenu.gridId = o.id;
										copyMenu.icon = g_v3.webcontext
												+ "/resource/v3image/button/small/Copy.png";

										copyMenu.listeners = {
											click : {
												fn : me.v3gridContextCopyMenuClick,
												scope : me
											}
										};
										menuconfig.push(copyMenu);
										var printmenu = {};
										printmenu.xtype = 'menuitem';
										printmenu.text = '本地打印';
										printmenu.width = 130;
										printmenu.gridId = o.id;
										printmenu.icon = g_v3.webcontext
												+ "/resource/v3image/button/small/16_print.gif";
										printmenu.listeners = {
											click : {
												fn : me.v3gridContextPrintMenuClick,
												scope : me
											}
										};

										menuconfig.push(printmenu);

										var exportmenu = {};
										exportmenu.xtype = 'menuitem';
										exportmenu.text = '另存为';
										exportmenu.width = 130;
										exportmenu.icon = g_v3.webcontext
												+ "/resource/v3image/button/small/Folder-Open.png";
										exportmenu.menu = {
											xtype : 'menu',
											width : 120,
											items : []
										};

										var exportExcelmenu = {};
										exportExcelmenu.xtype = 'menuitem';
										exportExcelmenu.text = 'Excel';
										exportExcelmenu.width = 130;
										exportExcelmenu.gridId = o.id;
										exportExcelmenu.icon = g_v3.webcontext
												+ "/resource/v3image/button/small/16_excel.gif";

										exportExcelmenu.listeners = {
											click : {
												fn : me.v3gridContextExportExcelMenuClick,
												scope : me
											}
										};

										exportmenu.menu.items
												.push(exportExcelmenu);

										var exportdbfmenu = {};
										exportdbfmenu.xtype = 'menuitem';
										exportdbfmenu.text = 'DBF';
										exportdbfmenu.width = 130;
										exportdbfmenu.gridId = o.id;
										exportdbfmenu.icon = g_v3.webcontext
												+ "/resource/v3image/button/small/ico_16_exportCustomizations.gif";

										exportdbfmenu.listeners = {
											click : {
												fn : me.v3gridContextExportDBFMenuClick,
												scope : me
											}
										};
										exportmenu.menu.items
												.push(exportdbfmenu);
										menuconfig.push(exportmenu);

										if (g_v3.inDevMode) {
											var logmenu = {};
											logmenu.xtype = 'menuitem';
											logmenu.text = '错误日志';
											logmenu.width = 130;
											logmenu.gridId = o.id;
											logmenu.icon = g_v3.webcontext
													+ "/resource/v3image/button/small/Web-warn.png";
											logmenu.listeners = {
												click : {
													fn : me.v3gridContextLogMenuClick,
													scope : me
												}
											};
											menuconfig.push(logmenu);
										}
										if (o.v3insertable) {
											var insertmenu = {};
											insertmenu.xtype = 'menuitem';
											insertmenu.text = '新增一行';
											insertmenu.width = 130;
											insertmenu.gridId = o.id;
											insertmenu.icon = g_v3.webcontext
													+ "/resource/v3image/button/small/18_addView.gif";

											insertmenu.listeners = {
												click : {
													fn : me.v3gridContextInsertMenuClick,
													scope : me
												}
											};
											menuconfig.push('-');
											menuconfig.push(insertmenu);

										}
										if (o.v3deleteable) {
											var deletemenu = {};
											deletemenu.xtype = 'menuitem';
											deletemenu.text = '删除一行';
											deletemenu.width = 130;
											deletemenu.gridId = o.id;

											deletemenu.icon = g_v3.webcontext
													+ "/resource/v3image/button/small/Application-del.png";

											deletemenu.listeners = {
												click : {
													fn : me.v3gridContextDeleteMenuClick,
													scope : me
												}
											};

											menuconfig.push(deletemenu);

										}

										o.viewConfig.v3contextmenu = Ext
												.create('Ext.menu.Menu', {
													items : menuconfig
												});
										if (!o.viewConfig.listeners) {
											o.viewConfig.listeners = {};
										}
										o.viewConfig.listeners.itemcontextmenu = me.v3griditemcontextmenu;
										o.viewConfig.listeners.containercontextmenu = me.v3gridcontainercontextmenu;
									}

									/* end */
									var canmodify = false;
									if (o.plugins instanceof Array) {

										for ( var i in o.plugins) {
											var plugin = o.plugins[i];
											if (plugin instanceof Ext.grid.plugin.RowEditing
													|| plugin instanceof Ext.grid.plugin.CellEditing) {
												canmodify = true;
												break;
											}
										}
									}
									// if (! o.dicsearchdataset ) {
									for (var j = 0; j < o.columns.length; j++) {
										var gridcolumn = o.columns[j];
										if (gridcolumn.dicdynamicobject) {

											var defaultl2c = 'CODELABEL2CODE';
											if (typeof gridcolumn.defaultl2c != 'undefined') {
												defaultl2c = gridcolumn.defaultl2c;
											}
											var did = 'dynamic_'
													+ gridcolumn.dicdynamicobject
															.toLowerCase();/* +";"+defaultl2c; */

											var column = me.pickerStore[did];
											if (typeof gridcolumn.editor == "undefined") {
												gridcolumn.editor = {};

											}
											// gridcolumn.editor.xtype=
											// 'v3gridtriggerfield';
											this.mappingProperties(
													gridcolumn.editor,
													column.exP, "grid");

										} else if (gridcolumn.dicstaticobject) {
											var defaultl2c = 'CODELABEL2CODE';
											gridcolumn.xtype = 'v3gridtriggerfield';
											if (typeof gridcolumn.defaultl2c != 'undefined') {
												defaultl2c = gridcolumn.defaultl2c;
											}
											var did = 'static_'
													+ gridcolumn.dicstaticobject
															.toLowerCase();/* +";"+defaultl2c; */

											var column = me.pickerStore[did];
											// gridcolumn.editor.xtype=
											// 'combobox';
											gridcolumn.renderer = Ext.util.Format
													.listValuesRender(column.exP.store);
											this.mappingProperties(
													gridcolumn.editor,
													column.exP, "grid");
										} else if (gridcolumn.columns instanceof Array) {
											for (var kk = 0; kk < gridcolumn.columns.length; kk++) {
												var gridcolumn1 = gridcolumn.columns[kk];
												if (!gridcolumn1.dictable) {
													continue;
												}
												var dictable = me.dicStore[gridcolumn1.dictable
														.toLowerCase()];
												if (dictable) {
													for ( var row in dictable) {
														var diccolumn = dictable[row].exP;
														if (diccolumn.columnId
																.toLowerCase() == gridcolumn1.diccolumn
																.toLowerCase()) {
															gridcolumn1.text = diccolumn.fieldLabel;

															if (diccolumn.xtype == "hiddenfield") {
																gridcolumn1.hidden = true;
																continue;
															} else if (diccolumn.xtype == "combobox") {
																gridcolumn1.xtype = "gridcolumn";
																gridcolumn1.align = "left";
																gridcolumn1.renderer = Ext.util.Format
																		.listValuesRender(diccolumn.store);
															} else if (diccolumn.xtype == "triggerfield") {
																gridcolumn1.xtype = "gridcolumn";
																gridcolumn1.align = "left";
															} else if (diccolumn.xtype == "datefield"
																	|| diccolumn.xtype == "datetimefield"
																	|| diccolumn.xtype == "timefield") {
																gridcolumn1.xtype = "datecolumn";
																gridcolumn1.align = "center";
																if (typeof diccolumn.format != "undefined") {
																	gridcolumn1.formate = diccolumn.format;
																}
																gridcolumn1.renderer = Ext.util.Format
																		.dateRenderer(diccolumn.format);

															} else if (diccolumn.xtype == "checkboxfield") {
																gridcolumn1.xtype = "gridcolumn";
																gridcolumn1.align = "center";
															} else if (diccolumn.xtype == "numberfield") {
																gridcolumn1.xtype = "numbercolumn";
																gridcolumn1.align = "right";
																gridcolumn1.format = diccolumn.format;
															}

															if (diccolumn.readOnly
																	|| !canmodify) {
																gridcolumn1.editor = null;
																continue;
															}
															if (typeof gridcolumn1.editor == "undefined") {
																gridcolumn1.editor = {};
															}
															this
																	.mappingProperties(
																			gridcolumn1.editor,
																			diccolumn,
																			"grid");
															break;
														}
													}
												}
											}
										} else if (gridcolumn.dictable
												&& gridcolumn.diccolumn) {
											var dictable = me.dicStore[gridcolumn.dictable
													.toLowerCase()];
											if (dictable) {
												for ( var row in dictable) {
													var diccolumn = dictable[row].exP;
													if (diccolumn.columnId
															.toLowerCase() == gridcolumn.diccolumn
															.toLowerCase()) {
														gridcolumn.text = diccolumn.fieldLabel;

														if (diccolumn.xtype == "hiddenfield") {
															gridcolumn.hidden = true;
															continue;
														} else if (diccolumn.xtype == "combobox") {
															gridcolumn.xtype = "gridcolumn";
															gridcolumn.align = "left";
															gridcolumn.renderer = Ext.util.Format
																	.listValuesRender(diccolumn.store);
														} else if (diccolumn.xtype == "triggerfield") {
															gridcolumn.xtype = "gridcolumn";
															gridcolumn.align = "left";
														} else if (diccolumn.xtype == "datefield"
																|| diccolumn.xtype == "datetimefield"
																|| diccolumn.xtype == "timefield") {
															gridcolumn.xtype = "datecolumn";
															gridcolumn.align = "center";
															if (typeof diccolumn.format != "undefined") {
																gridcolumn.formate = diccolumn.format;
															}
															gridcolumn.renderer = Ext.util.Format
																	.dateRenderer(diccolumn.format);

														} else if (diccolumn.xtype == "checkboxfield") {
															gridcolumn.xtype = "gridcolumn";
															gridcolumn.align = "center";
														} else if (diccolumn.xtype == "numberfield") {
															gridcolumn.xtype = "numbercolumn";
															gridcolumn.align = "right";
															gridcolumn.format = diccolumn.format;
														}

														if (diccolumn.readOnly
																|| !canmodify) {
															gridcolumn.editor = null;
															continue;
														}
														if (typeof gridcolumn.editor == "undefined") {
															gridcolumn.editor = {};
														}
														this
																.mappingProperties(
																		gridcolumn.editor,
																		diccolumn,
																		"grid");
														break;
													}
												}
											}
										}
									}
									// }

								} else if (o.xtype == "textfield"
										|| o.xtype == "datefield"
										|| o.xtype == "checkboxfield"
										|| o.xtype == "timefield"
										|| o.xtype == "triggerfield"
										|| o.xtype == "combobox"
										|| o.xtype == "hiddenfield"
										|| o.xtype == "numberfield"
										|| o.xtype == "textareafield"
										|| o.xtype == "htmleditor") {

									if (o.dictable && o.diccolumn) {
										var dictable = me.dicStore[o.dictable
												.toLowerCase()];

										if (dictable) {
											for ( var row in dictable) {
												var column = dictable[row].exP;
												if (column.columnId
														.toLowerCase() == o.diccolumn
														.toLowerCase()
														&& !o.v3mapdone) {
													this.mappingProperties(o,
															column, "form");
													o.v3mapdone = true;
													break;
												}
											}

										}
									} else if (o.dicdynamicobject
											&& !o.v3mapdone) { /* 查询条件时 */
										var defaultl2c = 'CODELABEL2CODE';
										if (typeof o.defaultl2c != 'undefined') {
											defaultl2c = o.defaultl2c;
										}
										var did = 'dynamic_'
												+ o.dicdynamicobject
														.toLowerCase();/* +";"+defaultl2c; */

										var column = me.pickerStore[did];
										this.mappingProperties(o, column.exP,
												"form");
										o.v3mapdone = true;

									} else if (o.dicstaticobject
											&& !o.v3mapdone) { /* 查询条件时 */
										var defaultl2c = 'CODELABEL2CODE';
										if (typeof o.defaultl2c != 'undefined') {
											defaultl2c = o.defaultl2c;
										}
										var did = 'static_'
												+ o.dicstaticobject
														.toLowerCase();/* +";"+defaultl2c; */

										var column = me.pickerStore[did];

										this.mappingProperties(o, column.exP,
												"form");
										o.v3mapdone = true;

									}

								}
								var toitems = null;
								if (o.items && o.items instanceof Array
										&& o.items.length > 0) {
									toitems = o.items;
								} else {
									toitems = o.dockedItems;
								}
								if (toitems instanceof Array && toitems != null) {
									this.pathItems(toitems, rootContainer);

								}
							}

						}

					},

					initComponent : function() {
						var me = this;
						if (!g_v3.windowManager.mainFormPanelId) {
							g_v3.windowManager.mainFormPanelId = me.id;
						}
						if (!me.dicInitedDone && (me.items || me.dockedItems)) {

							var dictables = [];
							var operationids = [];
							var pickerObjects = [];
							var toitems = null;
							if (me.items && me.items instanceof Array
									&& me.items.length > 0) {
								toitems = me.items;
							} else {
								toitems = me.dockedItems;
							}
							if (me.dicsearchid) {
								window.v3dicsearchid = me.dicsearchid;
								Ext.Ajax
										.request({
											async : false,
											url : g_v3.webcontext
													+ '/v3search/'
													+ me.dicsearchid
													+ '/searchview/',
											headers : {
												accept : 'application/json'
											},
											method : 'GET',
											scope : this,
											success : function(response, opts) {
												var obj = Ext
														.decode(response.responseText);
												if (obj.result === 'SUCCESS') {
													me.dicSearchStore = obj.returnObject;
												} else {
													Ext.Msg
															.show({
																title : '错误信息',
																icon : Ext.Msg.WARNING,
																msg : obj.returnObject,
																buttons : Ext.Msg.CANCEL
															});
												}
											},
											failure : function(response, opts) {
												Ext.Msg.show({
													title : '提示',
													msg : '网络连接失败',
													buttons : Ext.Msg.CANCEL
												});
											}
										});

								me.pathSearchItems(toitems, me);
								// var str=Ext.encode(me.items);
								// window.teststring=str;

							}
							if (me.items && me.items instanceof Array
									&& me.items.length > 0) {
								me.buildDictables(operationids, dictables,
										me.items, pickerObjects);
							}
							if (me.dockedItems
									&& me.dockedItems instanceof Array
									&& me.dockedItems.length > 0) {
								me.buildDictables(operationids, dictables,
										me.dockedItems, pickerObjects);
							}

							Ext.Array
									.each(
											dictables,
											function(tableid) {
												/* 自定义模块关键字跳过 */
												if (tableid.indexOf("FAKE_") == 0
														|| tableid
																.indexOf("fake_") == 0) {
													return;
												}
												if (me.dicStore[tableid
														.toLowerCase()]) {
													return;
												}
												Ext.Ajax
														.request({
															async : false,
															url : g_v3.webcontext
																	+ '/service/system/dict/'
																	+ tableid
																	+ '/'
																	+ g_js.v3OperationName
																	+ '/',
															headers : {
																accept : 'application/json'
															},
															method : 'GET',
															scope : this,
															success : function(
																	response,
																	opts) {
																var obj = Ext
																		.decode(response.responseText);
																if (obj.result === 'SUCCESS') {
																	me.dicStore[tableid
																			.toLowerCase()] = obj.returnObject;
																} else {
																	Ext.Msg
																			.show({
																				title : '错误信息',
																				icon : Ext.Msg.WARNING,
																				msg : obj.returnObject,
																				buttons : Ext.Msg.CANCEL
																			});
																}
															},
															failure : function(
																	response,
																	opts) {
																Ext.Msg
																		.show({
																			title : '提示',
																			msg : '网络连接失败',
																			buttons : Ext.Msg.CANCEL
																		});
															}
														});

											});
							if (operationids.length > 0) {

								Ext.Ajax
										.request({
											async : false,
											url : g_v3.webcontext
													+ '/service/system/operationids/',
											headers : {
												accept : 'application/json',
												'Content-Type' : 'application/json'
											},
											method : 'POST',
											jsonData : operationids,
											scope : this,
											success : function(response, opts) {
												var obj = Ext
														.decode(response.responseText);
												if (obj.result === 'SUCCESS') {
													me.operationStore = obj.returnObject;

												} else {
													Ext.Msg
															.show({
																title : '错误信息',
																icon : Ext.Msg.WARNING,
																msg : obj.returnObject,
																buttons : Ext.Msg.CANCEL
															});
												}
											},
											failure : function(response, opts) {
												Ext.Msg.show({
													title : '提示',
													msg : '网络连接失败',
													buttons : Ext.Msg.CANCEL
												});
											}
										});
							}
							if (pickerObjects.length > 0) {
								Ext.Ajax.request({
									async : false,
									url : g_v3.webcontext
											+ '/service/system/picker/',
									headers : {
										accept : 'application/json',
										'Content-Type' : 'application/json'
									},
									method : 'POST',
									jsonData : pickerObjects,
									scope : this,
									success : function(response, opts) {
										var obj = Ext
												.decode(response.responseText);
										if (obj.result === 'SUCCESS') {
											me.pickerStore = obj.returnObject;

										} else {
											Ext.Msg.show({
												title : '错误信息',
												icon : Ext.Msg.WARNING,
												msg : obj.returnObject,
												buttons : Ext.Msg.CANCEL
											});
										}
									},
									failure : function(response, opts) {
										Ext.Msg.show({
											title : '提示',
											msg : '网络连接失败',
											buttons : Ext.Msg.CANCEL
										});
									}
								});
							}

							if (me.items && me.items instanceof Array
									&& me.items.length > 0) {
								me.pathItems(me.items, me);
							}
							if (me.dockedItems
									&& me.dockedItems instanceof Array
									&& me.dockedItems.length > 0) {
								me.pathItems(me.dockedItems, me);
							}

							me.dicInitedDone = true;
						}

						if (me.frame) {
							me.border = false;
						}

						me.initFieldAncestor();
						me.callParent();

						me.relayEvents(me.form, [

						'beforeaction',

						'actionfailed',

						'actioncomplete',

						'validitychange',

						'dirtychange' ]);

						if (me.pollForChanges) {
							me.startPolling(me.pollInterval || 500);
						}

					}
				});
/* jinzhen end */

/*
 * 增加下拉框类型的数据渲染
 */
Ext.apply(Ext.util.Format, {
	listValuesRender : function(listvalues) {
		return function(v) {
			for ( var i in listvalues) {
				if (listvalues[i][0] == v) {
					return listvalues[i][1];
				}
			}
			return "null";
		};
	}
});

/**
 * @author Fly
 * 
 * 该类继承于reader中的Json，主要作用是在store中用到ajax proxy读取从后台返回RSResponse， 例子： proxy: {
 * type: 'ajax', url: '/v3dm/manage/user/search', headers: { accept:
 * 'application/json' }, reader: { type: 'myjson' } }
 * 实用该类时root的路径一定要是RSResponse类（RSResponse具体结构看后台内容），即一般不用设置
 * 当RSResponse中Result为SUCCESS或者PENDING时，取出RSResponse中的ReturnObject中的数据使用callParent方法传给父类中的方法；
 * 当RSResponse中Result不为SUCCESS和PENDING时（可能是人为设置的FAIL或者系统爆出的EXCEPTION），其会根据ReturnObject中的信息弹出警告框
 */
Ext.define('Ext.data.reader.MyJson', {
	extend : 'Ext.data.reader.Json',
	alias : 'reader.myjson',

	/**
	 * 该方法就是其父类读取后台数据并解析成传给store数据的方法，在这设置一个判定看是传给store数据还是弹出警告框
	 */
	extractData : function(root) {
		var status = root.result;

		if (status == 'SUCCESS') {
			return this.callParent([ root.returnObject ]);
		} else if (status == "PENDING") {
			var message = '提交成功，ID号为' + root.returnObject;
			Ext.Msg.show({
				title : '提醒',
				icon : Ext.Msg.WARNING,
				msg : message,
				buttons : Ext.Msg.OK
			});
			return;
		} else {
			var message = root.returnObject;
			Ext.Msg.show({
				title : '警告',
				icon : Ext.Msg.WARNING,
				msg : message,
				buttons : Ext.Msg.OK
			});
			return;
		}
	}
});

/**
 * @author Fly
 * 
 * 该类继承于reader中的Json，主要作用是在store中用到ajax proxy读取从后台返回树形结构数据的RSResponse， 例子：
 * proxy: { type: 'ajax', url: '/v3dm/manage/user/search', headers: { accept:
 * 'application/json' }, reader: { type: 'mytreejson', root: 'returnObject' } }
 * 取returnObject中是否有类型为boolean的leaf参数， 若有则说明返回的内容是正确的，正常显示后面内容 若无则说明后台出错，弹出警告框
 */
Ext.define('Ext.data.reader.MyTreeJson', {
	extend : 'Ext.data.reader.Json',
	alias : 'reader.mytreejson',

	readRecords : function(data) {
		var me = this;
		if (typeof (data.result) == "undefined" || data.result != 'SUCCESS') {
			var message = null;
			if (data.result) {
				message = data.returnObject + "," + data.returnTag;
			} else {
				message = data;
			}
			Ext.Msg.show({
				title : '警告',
				icon : Ext.Msg.WARNING,
				msg : message,
				buttons : Ext.Msg.OK
			})
			return;

		}
		var root = Ext.isArray(data) ? data : me.getRoot(data);

		var status = typeof (root[0].leaf);

		if (status != "undefined") {
			if (status != 'boolean') {
				for ( var i in root) {
					if (root[i].leaf == '0' || root[i].leaf == 'false') {
						root[i].leaf = false;
					} else {
						root[i].leaf = true;
					}
				}
			}

			return this.callParent([ data ]);
		} else {
			var message = root;
			Ext.Msg.show({
				title : '警告',
				icon : Ext.Msg.WARNING,
				msg : message,
				buttons : Ext.Msg.OK
			})
		}
	}
});

Ext.override(Ext.form.field.ComboBox, {

	listeners : {
		select : function(combo, records, eOpts) {
			if (combo.getValue() == "" || combo.getValue() == "&nbsp;")
				combo.setValue(null);
		}
	}

});

Ext
		.override(
				Ext.data.Store,
				{

					getJsonData : function() {
						var me = this, list = new Array;

						for (var i = 0; i < me.getCount(); i++) {
							var record = me.getAt(i), modelId = record.modelName, model = Ext.ModelManager
									.getModel(modelId), fields = model
									.getFields(), associationsItems = record.associations.items, object = new Object();

							for ( var x in fields) {
								var mapping = fields[x].mapping, name = fields[x].name;

								if (mapping != '' && mapping != null) {
									var property = mapping.split('.'), length = property.length;

									switch (length) {
									case 1:
										object[property[0]] = record.get(name);
										break;
									case 2:
										if (object[property[0]] == undefined) {
											object[property[0]] = new Object();
										}
										object[property[0]][property[1]] = record
												.get(name);
										break;
									case 3:
										if (object[property[0]] == undefined) {
											object[property[0]] = new Object();
										}
										if (object[property[1]] == undefined) {
											object[property[1]] = new Object();
										}
										object[property[0]][property[1]][property[2]] = record
												.get(name);
										break;
									}
								} else {
									object[name] = record.get(name);
								}
							}

							for ( var x in associationsItems) {
								var association = associationsItems[x], name = association.name, storeName = association.storeName, type = association.type;

								if (type == 'hasMany') {
									if (record[storeName] != undefined) {
										object[name] = record[storeName]
												.getJsonData();
									}
								}
							}

							list.push(object);
						}

						return list;
					}
				});

Ext
		.override(
				Ext.panel.Table,
				{

					findColumnByDataIndex : function(dataIndex) {
						var me = this, columns = me.columns, dataIndexes = Ext.Array
								.pluck(columns, 'dataIndex'), index = Ext.Array
								.indexOf(dataIndexes, dataIndex);

						return columns[index];
					},

					hideColumns : function(dataIndexes) {
						Ext.Array.each(dataIndexes, function(dataIndex) {
							this.findColumnByDataIndex(dataIndex).hide();
						}, this);
					},

					showColumns : function(dataIndexes) {
						Ext.Array.each(dataIndexes, function(dataIndex) {
							this.findColumnByDataIndex(dataIndex).show();
						}, this);
					},

					initExtColumns : function(configList) {
						var me = this, store = me.store, model = store
								.getProxy().getModel(), fields = model
								.getFields(), headerCt = me.headerCt, columns = headerCt ? headerCt.items
								.getRange()
								: me.columns, fieldInfos = [], // 所有field的信息
						columnInfos = [], // 所有column的信息
						columnInfo = {}, // 单个column信息
						editor = {}, // 当有编辑时使用edit信息
						point = -1, // 扩展字段位置
						needRecfg = false, // 是否刷新配置的标记，当有字段删除||字段添加，该字段就为true
						pickerObjects = [], // 静动态对象的信息
						pickerStore = {}, // 返回的静动态对象内容
						firstExt, newColumns;

						Ext.Array.each(fields, function(field) {
							fieldInfos.push({
								name : field['name'],
								type : field['type']['type']
							});
						});

						Ext.Array.each(columns, function(column) {
							columnInfos.push(column.initialConfig);
						});

						if (Ext.isEmpty(columnInfos[0]['dataIndex'])
								&& columnInfos[0]['isCheckerHd'] === true) {
							Ext.Array.remove(columnInfos, columnInfos[0]);
						}

						// 找出第一个扩展字段
						firstExt = Ext.Array.findBy(fieldInfos,
								function(field) {
									if (Ext.String.startsWith(field['name'],
											'ext_')) {
										return true;
									}
								});

						// 当有扩展字段时，给出其位置
						if (!firstExt === null) {
							point = Ext.Array.indexOf(fieldInfos, firstExt);
						}

						// 如果有扩展字段，这把对应扩展字段信息全过滤掉
						if (point > -1) {
							needRecfg = true;

							point = point - fieldInfos.size();
							fieldInfos = Ext.Array.slice(fieldInfos, 0, point);
							columnInfos = Ext.Array
									.slice(columnInfos, 0, point);
						}

						if (Ext.isArray(configList)) {
							needRecfg = true;

							// 过滤全部
							Ext.Array
									.each(
											configList,
											function(config) {
												if (config['xtype'] === 'triggerfield'
														&& !Ext
																.isEmpty(config['remark'])) {
													remarkInfo = Ext
															.decode(config['remark']);
													if (remarkInfo['dynamic'] != undefined) {
														pickerObjects
																.push('dynamic_'
																		+ remarkInfo['dynamic']
																		+ ';'
																		+ (remarkInfo['l2c'] === undefined ? 'CODELABEL2CODE'
																				: remarkInfo['l2c']));
													}
												}
												if (config['xtype'] === 'combo'
														&& !Ext
																.isEmpty(config['remark'])) {
													remarkInfo = Ext
															.decode(config['remark']);
													if (remarkInfo['static'] != undefined) {
														pickerObjects
																.push('static_'
																		+ remarkInfo['static']
																		+ ';'
																		+ (remarkInfo['l2c'] === undefined ? 'CODELABEL2CODE'
																				: remarkInfo['l2c']));
													}
												}
											});

							if (pickerObjects.length > 0) {
								Ext.Ajax.request({
									async : false,
									url : g_v3.webcontext
											+ '/service/system/picker/',
									headers : {
										accept : 'application/json',
										'Content-Type' : 'application/json'
									},
									method : 'POST',
									jsonData : pickerObjects,
									scope : this,
									success : function(response, opts) {
										var obj = Ext
												.decode(response.responseText);
										if (obj.result === 'SUCCESS') {
											pickerStore = obj.returnObject;
										} else {
											Ext.Msg.show({
												title : '错误信息',
												icon : Ext.Msg.WARNING,
												msg : obj.returnObject,
												buttons : Ext.Msg.CANCEL
											});
										}
									},
									failure : function(response, opts) {
										Ext.Msg.show({
											title : '提示',
											msg : '网络连接失败',
											buttons : Ext.Msg.CANCEL
										});
									}
								});
							}

							Ext.Array
									.each(
											configList,
											function(config) {
												fieldInfos.push({
													name : 'ext_'
															+ config['colName']
												});

												columnInfo = {
													text : config['label'],
													dataIndex : 'ext_'
															+ config['colName']
												};

												if (config['canEdit'] === '1') {
													editor = {
														xtype : config['xtype']
													};

													switch (config['xtype']) {
													case 'datefield':
														editor['format'] = 'Y-m-d';
														break;
													case 'datetimefield':
														editor['format'] = 'Y-m-d H:i:s';
														break;
													case 'numberfield':
														editor['hideTrigger'] = true;
														break;
													}

													if (!Ext
															.isEmpty(config['remark'])) {
														remarkInfo = Ext
																.decode(config['remark']);

														if (remarkInfo['dynamic'] != undefined
																&& pickerStore['dynamic_'
																		+ remarkInfo['dynamic']] != undefined) {
															editor = Ext.Object
																	.merge(
																			editor,
																			pickerStore['dynamic_'
																					+ remarkInfo['dynamic']]['exP']);
														} else if (remarkInfo['static'] != undefined
																&& pickerStore['static_'
																		+ remarkInfo['static']
																				.toLowerCase()] != undefined) {
															editor = Ext.Object
																	.merge(
																			editor,
																			pickerStore['static_'
																					+ remarkInfo['static']
																							.toLowerCase()]['exP']);
														}

														editor = Ext.Object
																.merge(editor,
																		remarkInfo);
													}

													columnInfo['editor'] = editor
												}

												columnInfos.push(columnInfo);
											});
						}

						if (needRecfg) {
							model.setFields(fieldInfos);
							me.reconfigure(store, columnInfos);
						}
					}
				});

Ext
		.override(
				Ext.form.Panel,
				{

					getFormatValues : function(asString, dirtyOnly,
							includeEmptyText, useDataValues) {
						return this.getForm().getFormatValues(asString,
								dirtyOnly, includeEmptyText, useDataValues);
					},

					loadFormatRecord : function(record) {
						return this.getForm().loadFormatRecord(record);
					},

					validForField : function() {
						return this.form.validForField();
					},

					setReadOnly : function(nameList) {
						var fields = this.form.getFields().items, typeList = [
								'checkboxfield', 'combobox', 'datefield',
								'filefield', 'htmleditor', 'numberfield',
								'pickerfield', 'radiofield', 'spinnerfield',
								'textfield', 'textareafield', 'timefield',
								'triggerfield', 'v3treetriggerfield',
								'v3gridtriggerfield' ], fieldType;

						if (!Array.isArray(nameList)) {
							if (nameList == null) {
								nameList = [];
							} else {
								throw new Exception('传入参数必须为空或者是Array！');
							}
						}

						if (Array.isArray(fields)) {
							Ext.Array.each(fields, function(field) {
								fieldName = field.getName();
								fieldType = field.getXType();

								if (typeList.indexOf(fieldType) > -1
										&& nameList.indexOf(fieldName) < 0
										&& !field.readOnly) {
									field.setReadOnly(true);
									field.setFieldLabel('<font color=blue>'
											+ field.fieldLabel + '</font>');
								}
							});
						}
					},

					initExtFields : function(configList, initCfg) {
						var me = this, fields = this.form.getFields().items, removeList = [], pickerObjects = [], pickerStore = {}, xtype, remarkInfo, fieldCfg;

						Ext.Array.each(fields,
								function(field) {
									if (Ext.String.startsWith(field.getName(),
											'ext_')) {
										removeList.push(field);
									}
								}, me);

						Ext.Array.each(removeList, function(removeField) {
							this.remove(removeField);
						}, me);

						if (Ext.isArray(configList)) {
							Ext.Array
									.each(
											configList,
											function(config) {
												if (config['xtype'] === 'triggerfield'
														&& !Ext
																.isEmpty(config['remark'])) {
													remarkInfo = Ext
															.decode(config['remark']);
													if (remarkInfo['dynamic'] != undefined) {
														pickerObjects
																.push('dynamic_'
																		+ remarkInfo['dynamic']
																		+ ';'
																		+ (remarkInfo['l2c'] === undefined ? 'CODELABEL2CODE'
																				: remarkInfo['l2c']));
													}
												}
												if (config['xtype'] === 'combo'
														&& !Ext
																.isEmpty(config['remark'])) {
													remarkInfo = Ext
															.decode(config['remark']);
													if (remarkInfo['static'] != undefined) {
														pickerObjects
																.push('static_'
																		+ remarkInfo['static']
																		+ ';'
																		+ (remarkInfo['l2c'] === undefined ? 'CODELABEL2CODE'
																				: remarkInfo['l2c']));
													}
												}
											});

							if (pickerObjects.length > 0) {
								Ext.Ajax.request({
									async : false,
									url : g_v3.webcontext
											+ '/service/system/picker/',
									headers : {
										accept : 'application/json',
										'Content-Type' : 'application/json'
									},
									method : 'POST',
									jsonData : pickerObjects,
									scope : this,
									success : function(response, opts) {
										var obj = Ext
												.decode(response.responseText);
										if (obj.result === 'SUCCESS') {
											pickerStore = obj.returnObject;
										} else {
											Ext.Msg.show({
												title : '错误信息',
												icon : Ext.Msg.WARNING,
												msg : obj.returnObject,
												buttons : Ext.Msg.CANCEL
											});
										}
									},
									failure : function(response, opts) {
										Ext.Msg.show({
											title : '提示',
											msg : '网络连接失败',
											buttons : Ext.Msg.CANCEL
										});
									}
								});
							}

							Ext.Array
									.each(
											configList,
											function(config) {
												xtype = config['xtype'];
												fieldCfg = Ext.clone(initCfg
														|| {});

												fieldCfg['xtype'] = xtype;
												fieldCfg['fieldLabel'] = config['label'];
												fieldCfg['name'] = 'ext_'
														+ config['colName'];

												if (config['canEdit'] === '0') {
													fieldCfg['readOnly'] = true;
												}

												if (!Ext
														.isEmpty(config['defaultValue'])) {
													fieldCfg['value'] = config['defaultValue']
												}

												switch (xtype) {
												case 'datefield':
													fieldCfg['format'] = 'Y-m-d';
													break;
												case 'datetimefield':
													fieldCfg['format'] = 'Y-m-d H:i:s';
													break;
												case 'numberfield':
													fieldCfg['hideTrigger'] = true;
													break;
												}

												if (!Ext
														.isEmpty(config['remark'])) {
													remarkInfo = Ext
															.decode(config['remark']);

													if (remarkInfo['dynamic'] != undefined
															&& pickerStore['dynamic_'
																	+ remarkInfo['dynamic']] != undefined) {
														fieldCfg = Ext.Object
																.merge(
																		fieldCfg,
																		pickerStore['dynamic_'
																				+ remarkInfo['dynamic']]['exP']);
													} else if (remarkInfo['static'] != undefined
															&& pickerStore['static_'
																	+ remarkInfo['static']
																			.toLowerCase()] != undefined) {
														fieldCfg = Ext.Object
																.merge(
																		fieldCfg,
																		pickerStore['static_'
																				+ remarkInfo['static']
																						.toLowerCase()]['exP']);
													}

													fieldCfg = Ext.Object
															.merge(fieldCfg,
																	remarkInfo);
												}

												this.add(fieldCfg);
											}, me);
						}
					}
				});

Ext.override(Ext.form.field.Base, {

	getFormatName : function() {
		var me = this, names, formatName;

		if (!Ext.isEmpty(me.name)) {
			names = me.name.split('.');
			formatName = names[names.length - 1];
		} else if (!Ext.isEmpty(me.id)) {
			formatName = me.id
		}

		return formatName;
	}

});

Ext
		.override(
				Ext.form.Basic,
				{

					getFormatValues : function(asString, dirtyOnly,
							includeEmptyText, useDataValues) {
						var values = {}, fields = this.getFields().items, f, fLen = fields.length, isArray = Ext.isArray, field, data, val, bucket, name, mappings, count;

						for (f = 0; f < fLen; f++) {
							field = fields[f];

							if (!dirtyOnly || field.isDirty()) {
								data = field[useDataValues ? 'getModelData'
										: 'getSubmitData'](includeEmptyText);

								if (Ext.isObject(data)) {
									for (name in data) {
										if (data.hasOwnProperty(name)) {
											val = data[name];

											if (includeEmptyText && val === '') {
												val = field.emptyText || '';
											}

											mappings = name.split('\.');
											count = mappings.length;

											switch (count) {
											case 1:
												if (values
														.hasOwnProperty(mappings[0])) {
													bucket = values[mappings[0]];

													if (!isArray(bucket)) {
														bucket = values[mappings[0]] = [ bucket ];
													}

													if (isArray(val)) {
														values[mappings[0]] = bucket
																.concat(val);
													} else {
														bucket.push(val);
													}
												} else {
													values[mappings[0]] = val;
												}
												break;
											case 2:
												if (values
														.hasOwnProperty(mappings[0])) {
													if (values[mappings[0]]
															.hasOwnProperty(mappings[1])) {
														bucket = values[mappings[0]][mappings[1]];

														if (!isArray(bucket)) {
															bucket = values[mappings[0]][mappings[1]] = [ bucket ];
														}

														if (isArray(val)) {
															values[mappings[0]][mappings[1]] = bucket
																	.concat(val);
														} else {
															bucket.push(val);
														}
													} else {
														values[mappings[0]][mappings[1]] = val;
													}
												} else {
													values[mappings[0]] = {};
													values[mappings[0]][mappings[1]] = val;
												}
												break;
											case 3:
												if (values
														.hasOwnProperty(mappings[0])) {
													if (values[mappings[0]]
															.hasOwnProperty(mappings[1])) {
														if (values[mappings[0]][mappings[1]]
																.hasOwnProperty(mappings[2])) {
															bucket = values[mappings[0]][mappings[1]][mappings[2]];

															if (!isArray(bucket)) {
																bucket = values[mappings[0]][mappings[1]][mappings[2]] = [ bucket ];
															}

															if (isArray(val)) {
																values[mappings[0]][mappings[1]][mappings[2]] = bucket
																		.concat(val);
															} else {
																bucket
																		.push(val);
															}
														} else {
															values[mappings[0]][mappings[1]][mappings[2]] = val;
														}
													} else {
														values[mappings[0]][mappings[1]] = {};
														values[mappings[0]][mappings[1]][mappings[2]] = val;
													}
												} else {
													values[mappings[0]] = {};
													values[mappings[0]][mappings[1]] = {};
													values[mappings[0]][mappings[1]][mappings[2]] = val;
												}
												break;
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

					loadFormatRecord : function(record) {
						this._record = record;
						return this.setFormatValues(record.getData());
					},

					setFormatValues : function(values) {
                        if(Ext.isEmpty(values)) {
                            return false;
                        }

						var me = this, fields = me.getFields().items, objValue = Ext
								.isArray(values) ? me.arrayToObj(values)
								: values, fieldName;

						function setVal(field, val) {
							if (field) {
								if (field.getXType() == 'datefield'
										&& typeof val == 'string') {
									field.setValue(new Date(val.replace(/-/g,
											'/')));
								} else {
									field.setValue(val);
								}

								if (me.trackResetOnLoad) {
									field.resetOriginalValue();
								}
							}
						}

						Ext.suspendLayouts();

						Ext.Object.each(fields, function(index, field, self) {
							try {
								fieldName = field.getFormatName();
							} catch (e) {
							}

							if (objValue.hasOwnProperty(fieldName)) {
								setVal(field, objValue[fieldName]);
							}
						});

						Ext.resumeLayouts(true);

						return this;
					},

					arrayToObj : function(array) {
						var count = array.length, val, obj = {};

						for (var i = 0; i < count; i++) {
							val = array[i];

							obj[val.id] = val.value;
						}

						return obj;
					},

					findFormatField : function(id) {
						var name, names;

						return this.getFields().findBy(function(f) {
							if (f.id === id) {
								return true;
							}

							name = f.getName();

							if (name != undefined && name != null) {
								names = f.getName().split('.');
								return names[names.length - 1] === id;
							}
						});
					},

					validForField : function() {
						var me = this, flag = true;

						me.getFields().each(function(field) {
							if (!field.isValid()) {
								Ext.Msg.alert("信息错误", field.activeError);
								flag = false;
								return false;
							}
						});

						return flag;
					}

				});

/**
 * 重写proxy.Ajax类，用于load时使用json对象作为参数查询，并把提交方式改为POST
 */
Ext.override(Ext.data.proxy.Ajax, {
	doRequest : function(operation, callback, scope) {
		var writer = this.getWriter(), request = this.buildRequest(operation);

		if (operation.allowWrite()) {
			request = writer.write(request);
		}

		Ext.apply(request, {
			binary : this.binary,
			headers : this.headers,
			timeout : this.timeout,
			scope : this,
			callback : this.createRequestCallback(request, operation, callback,
					scope),
			method : this.getMethod(request),
			disableCaching : false,
			jsonData : operation.jsonData
		});

		if (operation.jsonData != undefined)
			request.method = 'POST';

		Ext.Ajax.request(request);

		return request;
	}
});

Ext.override(Ext.form.TriggerField, {

	constructor : function(config) {
		var me = this;

		me.addEvents('onpop');

		me.callParent([ config ]);
	},

	onTriggerClick : function() {
		var me = this;

		this.fireEvent('onpop', me);
	}
});

/**
 * 带时间的日期输入控件
 */
Ext.define('Ext.form.field.DateTime', {
	extend : 'Ext.form.field.Date',
	alias : 'widget.datetimefield',

	/**
	 * @cfg {String} format The default date format string which can be
	 *      overriden for localization support. The format must be valid
	 *      according to {@link Ext.Date#parse}.
	 */
	format : "Y-m-d H:i:s",

	/**
	 * @cfg {String} altFormats Multiple date formats separated by "|" to try
	 *      when parsing a user input value and it does not match the defined
	 *      format.
	 */
	altFormats : "Y-m-d H:i:s",

	createPicker : function() {
		var me = this, format = Ext.String.format;

		// 修改picker为自定义picker
		return new Ext.picker.DateTime({
			pickerField : me,
			ownerCt : me.ownerCt,
			renderTo : document.body,
			floating : true,
			hidden : true,
			fieldLabel : me.fieldLabel,
			focusOnShow : true,
			minDate : me.minValue,
			maxDate : me.maxValue,
			disabledDatesRE : me.disabledDatesRE,
			disabledDatesText : me.disabledDatesText,
			disabledDays : me.disabledDays,
			disabledDaysText : me.disabledDaysText,
			format : me.format,
			showToday : me.showToday,
			startDay : me.startDay,
			minText : format(me.minText, me.formatDate(me.minValue)),
			maxText : format(me.maxText, me.formatDate(me.maxValue)),
			listeners : {
				scope : me,
				select : me.onSelect
			},
			keyNavConfig : {
				esc : function() {
					me.collapse();
				}
			}
		});
	},

	/**
	 * @private
	 */
	onExpand : function() {
		var value = this.getValue();

		// 多传一个参数，从而避免时分秒被忽略。
		this.picker.setValue(Ext.isDate(value) ? value : new Date(), true);
	}
});

/**
 * A picker component what contained date and time. This class is used by the
 * Ext.form.field.DateTime field to allow browsing and selection of valid dates
 * and time in a popup next to the field, but may also be used with other
 * components. This class inherit Ext.picker.Date, and add element of time.
 * 
 * @author Li Degui
 * @modification Fly
 */
Ext
		.define(
				'Ext.picker.DateTime',
				{
					extend : 'Ext.picker.Date',
					alias : 'widget.datetimepicker',
					okText : '确定',
					okTip : '确定',

					renderTpl : [
							'<div id="{id}-innerEl" role="grid">',
							'<div role="presentation" class="{baseCls}-header">',
							'<a id="{id}-prevEl" class="{baseCls}-prev {baseCls}-arrow" href="#" role="button" title="{prevText}" hidefocus="on" ></a>',
							'<div class="{baseCls}-month" id="{id}-middleBtnEl">{%this.renderMonthBtn(values, out)%}</div>',
							'<a id="{id}-nextEl" class="{baseCls}-next {baseCls}-arrow" href="#" role="button" title="{nextText}" hidefocus="on" ></a>',
							'</div>',
							'<table id="{id}-eventEl" class="{baseCls}-inner" cellspacing="0" role="presentation">',
							'<thead role="presentation"><tr role="presentation">',
							'<tpl for="dayNames">',
							'<th role="columnheader" class="{parent.baseCls}-column-header" title="{.}">',
							'<div class="{parent.baseCls}-column-header-inner">{.:this.firstInitial}</div>',
							'</th>',
							'</tpl>',
							'</tr></thead>',
							'<tbody role="presentation"><tr role="presentation">',
							'<tpl for="days">',
							'{#:this.isEndOfWeek}',
							'<td role="gridcell" id="{[Ext.id()]}">',
							'<a role="presentation" hidefocus="on" class="{parent.baseCls}-date" href="#"></a>',
							'</td>',
							'</tpl>',
							'</tr></tbody>',
							'</table>',

							// render element of time
							'<table id="{id}-timeEl" style="table-layout:auto;width:auto;margin:0 3px;" class="x-datepicker-inner" cellspacing="0">',
							'<tbody><tr>',
							'<td>{%this.renderHourBtn(values,out)%}</td>',
							'<td>{%this.renderMinuteBtn(values,out)%}</td>',
							'<td>{%this.renderSecondBtn(values,out)%}</td>',
							'</tr></tbody>',
							'</table>',

							'<tpl if="showToday">',
							// add a button of OK to make sure the value
							'<div id="{id}-footerEl" role="presentation" class="{baseCls}-footer">{%this.renderOkBtn(values, out)%}{%this.renderTodayBtn(values, out)%}</div>',
							'</tpl>',
							'</div>',
							{
								firstInitial : function(value) {
									return Ext.picker.Date.prototype
											.getDayInitial(value);
								},
								isEndOfWeek : function(value) {
									// convert from 1 based index to 0 based
									// by decrementing value once.
									value--;
									var end = value % 7 === 0 && value !== 0;
									return end ? '</tr><tr role="row">' : '';
								},
								renderTodayBtn : function(values, out) {
									Ext.DomHelper.generateMarkup(
											values.$comp.todayBtn
													.getRenderTree(), out);
								},
								renderMonthBtn : function(values, out) {
									Ext.DomHelper.generateMarkup(
											values.$comp.monthBtn
													.getRenderTree(), out);
								},

								// render the button for hour
								renderHourBtn : function(values, out) {
									Ext.DomHelper.generateMarkup(
											values.$comp.hourBtn
													.getRenderTree(), out);
								},
								// render the button for minute
								renderMinuteBtn : function(values, out) {
									Ext.DomHelper.generateMarkup(
											values.$comp.minuteBtn
													.getRenderTree(), out);
								},
								// render the component for second
								renderSecondBtn : function(values, out) {
									Ext.DomHelper.generateMarkup(
											values.$comp.secondBtn
													.getRenderTree(), out);
								},
								renderOkBtn : function(values, out) {
									Ext.DomHelper.generateMarkup(
											values.$comp.okBtn.getRenderTree(),
											out);
								}
							} ],

					beforeRender : function() {
						var me = this, _$Number = Ext.form.field.Number;
						// 在组件渲染之前，将自定义添加的时、分、秒和确认按钮进行初始化
						// 组件宽度可能需要调整下，根据使用的theme不同，宽度需要调整
						me.hourBtn = new _$Number({
							minValue : 0,
							maxValue : 23,
							step : 1,
							width : 45
						});
						me.minuteBtn = new _$Number({
							minValue : 0,
							maxValue : 59,
							step : 1,
							width : 60,
							labelWidth : 10,
							fieldLabel : '&nbsp;'
						});
						me.secondBtn = new _$Number({
							minValue : 0,
							maxValue : 59,
							step : 1,
							width : 60,
							labelWidth : 10,
							fieldLabel : '&nbsp;'// auto add ":"
						});

						me.okBtn = new Ext.button.Button({
							ownerCt : me,
							ownerLayout : me.getComponentLayout(),
							text : me.okText,
							tooltip : me.okTip,
							tooltipType : 'title',
							handler : me.okHandler,// The action of button
							// which means OK
							scope : me
						});
						me.callParent();
					},

					finishRenderChildren : function() {
						var me = this;

						me.hourBtn.finishRender();
						me.minuteBtn.finishRender();
						me.secondBtn.finishRender();
						me.okBtn.finishRender();
						me.callParent();
					},

					/**
					 * the function of okHandler
					 */
					okHandler : function() {
						var me = this, btn = me.okBtn;

						if (btn && !btn.disabled) {
							me.setValue(this.getValue());
							me.fireEvent('select', me, me.value);
							me.onSelect();
						}
						return me;
					},

					/**
					 * 覆盖了父类的方法，因为父类中是根据时间的getTime判断的，因此需要对时、分、秒分别值为0才能保证当前值的日期选择
					 * 
					 * @private
					 * @param {Date}
					 *            date The new date
					 */
					selectedUpdate : function(date) {
						this.callParent([ Ext.Date.clearTime(date, true) ]);
					},

					/**
					 * 更新picker的显示内容，需要同时更新时、分、秒输入框的值
					 * 
					 * @private
					 * @param {Date}
					 *            date The new date
					 * @param {Boolean}
					 *            forceRefresh True to force a full refresh
					 */
					update : function(date, forceRefresh) {
						var me = this;
						me.hourBtn.setValue(date.getHours());
						me.minuteBtn.setValue(date.getMinutes());
						me.secondBtn.setValue(date.getSeconds());

						return this.callParent(arguments);
					},

					/**
					 * 从picker选中后，赋值时，需要从时、分、秒也获得当前值
					 * datetimefield也会调用这个方法对picker初始化，因此添加一个isfixed参数。
					 * 
					 * @param {Date}
					 *            date The new date
					 * @param {Boolean}
					 *            isfixed True 时，忽略从时分秒中获取值
					 */
					setValue : function(date, isfixed) {
						var me = this;
						if (isfixed !== true) {
							date.setHours(me.hourBtn.getValue());
							date.setMinutes(me.minuteBtn.getValue());
							date.setSeconds(me.secondBtn.getValue());
						}
						me.value = date;
						me.update(me.value);
						return me;
					},

					// @private
					// @inheritdoc
					beforeDestroy : function() {
						var me = this;

						if (me.rendered) {
							// 销毁组件时，也需要销毁自定义的控件
							Ext.destroy(me.hourBtn, me.minuteBtn, me.secondBtn,
									me.okBtn);
						}
						me.callParent();
					}
				}, function() {
					var proto = this.prototype, date = Ext.Date;

					proto.monthNames = date.monthNames;
					proto.dayNames = date.dayNames;
					proto.format = date.defaultFormat;
				});

// vtype验证
Ext
		.apply(
				Ext.form.field.VTypes,
				{
					getByteLen : function(val) {
						var len = 0;
						for (var i = 0; i < val.length; i++) {
							if (val.charAt(i).match(/[^\x00-\xff]/ig) != null) // 全角
								len += 2;
							else
								len += 1;
						}
						return len;
					},
					// 最大长度
					maxLength : function(val, field) {
						try {
							if (this.getByteLen(val) <= parseInt(field.maxLen))
								return true;
							return false;
						} catch (e) {
							return false;
						}
					},
					maxLengthText : '长度过大',
					// url and 最大长度
					urlOrMaxLength : function(val, field) {
						try {
							var url = /(((^https?)|(^ftp)):\/\/((([\-\w]+\.)+\w{2,3}(\/[%\-\w]+(\.\w{2,})?)*(([\w\-\.\?\\\/+@&#;`~=%!]*)(\.\w{2,})?)*)|(localhost|LOCALHOST))\/?)/i;
							if (url.test(val)
									&& this.getByteLen(val) <= parseInt(field.maxLen)) {
								return true;
							}
							return false;
						} catch (e) {
							return false;
						}
					},
					urlOrMaxLengthText : '格式错误或长度过大'
				});

Ext
		.override(
				Ext.data.TreeStore,
				{
					reloadTree : function(fn, scope, id) {
						var me = this, root = me.getRootNode(), isExpandedIds = me
								.getExpandedNodes(root);

						me.load({
							scope : this,
							callback : function(records, operation, success) {
								this.setExpandedNodes(root, isExpandedIds
										.split('--'));
								if (fn instanceof Function) {
									fn.call(scope, id, records);
								}
							}
						})
					},

					getExpandedNodes : function(node) {
						var childNodes = node.childNodes, length = childNodes.length, ids = '';

						for (var i = 0; i < length; i++) {
							if (childNodes[i].isExpanded()) {
								ids += childNodes[i].get('id') + '--';
								if (childNodes[i].hasChildNodes())
									ids += this.getExpandedNodes(childNodes[i]);
							}
						}

						return ids;
					},

					setExpandedNodes : function(node, ids) {
						var childNodes = node.childNodes, childLength = childNodes.length, idLength = ids.length;

						for (var i = 0; i < childLength; i++) {
							if (!childNodes[i].isLeaf()) {
								for (var j = 0; j < idLength; j++) {
									if (childNodes[i].get('id') == ids[j]) {
										childNodes[i].expand();
										ids.splice(j, 1);
										this.setExpandedNodes(childNodes[i],
												ids);
									}
								}
							}
						}
					},

					getAllData : function(fields) {
						var me = this, root = me.getRootNode(), data = root
								.getNodeData(fields);

						return data;
					}
				});

Ext
		.override(
				Ext.data.Model,
				{

					getNodeData : function(fields) {
						var me = this, node = me.getValues(fields), children = new Array();

						me.eachChild(function(childNode) {
							children.push(childNode.getNodeData(fields));
						});

						node['returnObject'] = children;

						return node;
					},

					getValues : function(fields) {
						var extendFields = new Array('parentId', 'index',
								'depth', 'expanded', 'expandable', 'checked',
								'cls', 'iconCls', 'icon', 'root', 'isLast',
								'isFirst', 'allowDrop', 'allowDrag', 'loaded',
								'loading', 'href', 'hrefTarget', 'qtip',
								'qtitle', 'qshowDelay', 'children'), me = this, record = me
								.getData();

						if (fields instanceof Array) {
							var fieldLength = fields.length;

							for (var i = 0; i < fieldLength; i++) {
								var field = fields[i], count = extendFields.length;

								for (var j = 0; j < count; j++) {
									if (field == extendFields[j]) {
										extendFields.splice(j, 1);
										break;
									}
								}
							}
						}

						var count = extendFields.length;

						for (var i = 0; i < count; i++) {
							delete record[extendFields[i]];
						}

						for ( var property in record) {
							if (record[property] === '') {
								delete record[property];
							}
						}

						return record;
					},

					getJsonData : function() {
						var me = this, fields = me.fields.items, associationsItems = me.associations.items, data = {}, mapping, name, property, pCount, value, association, associationname, storeName, associationType;

						for ( var x in fields) {
							mapping = fields[x].mapping;
							name = fields[x].name;
							value = me.get(name);

							if (typeof value == 'string' && value == ''
									|| value == null) {
								continue;
							}
							if (mapping != '' && mapping != null) {
								property = mapping.split('.');
								pCount = property.length;

								switch (pCount) {
								case 1:
									data[property[0]] = value;
									break;
								case 2:
									if (data[property[0]] == undefined) {
										data[property[0]] = new Object();
									}
									data[property[0]][property[1]] = value;
									break;
								case 3:
									if (data[property[0]] == undefined) {
										data[property[0]] = new Object();
									}
									if (data[property[1]] == undefined) {
										data[property[1]] = new Object();
									}
									data[property[0]][property[1]][property[2]] = value;
									break;
								}
							} else {
								data[name] = value;
							}
						}

						for ( var x in associationsItems) {
							association = associationsItems[x];
							associationname = association.name;
							storeName = association.storeName;
							associationType = association.type;

							if (associationType == 'hasMany') {
								if (me[storeName] != undefined) {
									data[associationname] = me[storeName]
											.getJsonData();
								}
							}
						}

						return data;
					}

				});

Ext
		.define(
				'Ext.ux.grid.feature.RemoteSummary',
				{

					/* Begin Definitions */

					extend : 'Ext.grid.feature.Summary',

					alias : 'feature.ux.remotesummary',

					createSummaryRecord : function(view) {
						var me = this;
						var columns = view.headerCt.getVisibleGridColumns(), info = {
							records : view.store.getRange()
						}, colCount = columns.length, i, column, summaryRecord = this.summaryRecord
								|| (this.summaryRecord = new view.store.model(
										null, view.id + '-summary-record'));

						var store = me.view.store, summaryRow, reader = store.proxy.reader;
						if (reader.rawData) {
							var colNames = reader.rawData["colNames"];
							if (colNames && me.grid) {
								var colHeaders = Ext.DomQuery.select(
										"[class*=x-column-header-text ]",
										me.grid.dom, null, false);
								if (colHeaders) {
									for ( var i in colHeaders) {
										var head = colHeaders[i];
										if (!head.initColName) {
											head.initColName = head.innerText;
										}
										var fixedName = colNames[head.initColName];
										if (fixedName && fixedName != "") {
											head.innerText = fixedName;
										}
									}
								}

							}
						}

						summaryRecord.beginEdit();
						if (me.remoteRoot && reader.rawData) {
							var summaryObject = reader.rawData[me.remoteRoot];
							for ( var prop in summaryObject) {
								summaryRecord.set(prop, summaryObject[prop]);
							}
						} else {
							for (i = 0; i < colCount; i++) {
								column = columns[i];

								if (!column.dataIndex) {
									column.dataIndex = column.id;
								}

								summaryRecord.set(column.dataIndex, this
										.getSummary(view.store,
												column.summaryType,
												column.dataIndex, info));
							}
						}
						summaryRecord.endEdit(true);

						summaryRecord.commit(true);
						summaryRecord.isSummary = true;

						return summaryRecord;
					}

				});

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

	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : option.waitMsg,
		msgCls : 'z-index:10000;'
	});
	myMask.show();

	option.form.submit({
		url : option.url,
		headers : {
			accept : 'application/json'
		},

		method : option.method,
		clientValidation : false,
		// waitMsg:option.waitMsg,
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

/**
 * 支持 rsreponse pending 异步相应的ajax调用,json格式数据传输 兼容原有 直接返回sucess的rsreponse params：
 * option option.jsonData 提交的数据 option.method POST\GET option.scope option.url
 * option.waitMsg 等待执行的提示信息
 * 
 * success function(rsResponse, opts){ //rsResponse 就算 java端的RSResponse
 *  }
 * 
 * exception function(rsResponse, opts){ //rsResponse 就算 java端的RSResponse
 *  }
 */

g_v3.excuteSelectorMethod = function(selector, methodName, params) {
	var btns = Ext.ComponentQuery.query(selector);
	for ( var b in btns) {
		if ('function' == typeof (btns[b][methodName])) {
			btns[b][methodName](params);
		}
	}
};

g_v3.ajax = function(option) {

	option.method = option.method || 'POST';

	option.waitMsg = option.waitMsg || '正在执行，请稍等....';
	var myMask = new Ext.LoadMask(Ext.getBody(), {
		msg : option.waitMsg,
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
		// scope: option.scope ,
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


var Base64 = (function() {

    // private property
    var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

    // private method for UTF-8 encoding
    function utf8Encode(string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    }

    // public method for encoding
    return {
        //This was the original line, which tries to use Firefox's built in Base64 encoder, but this kept throwing exceptions....
        // encode : (typeof btoa == 'function') ? function(input) { return btoa(input); } : function (input) {
        
        
        encode : function (input) {
            var output = "";
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
            var i = 0;
            input = utf8Encode(input);
            while (i < input.length) {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;
                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }
                output = output +
                keyStr.charAt(enc1) + keyStr.charAt(enc2) +
                keyStr.charAt(enc3) + keyStr.charAt(enc4);
            }
            return output;
        }
    };
})();