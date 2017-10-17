Ext.define('Treecombo.store.NoCheckedTree', {
    extend: 'Ext.data.TreeStore',

    constructor: function(cfg) {
        var me = this;
        cfg = cfg || {};
        me.callParent([Ext.apply({
            storeId: 'NoCheckedTree',
            root: {
                expanded: true,
                children: [
                    {
                        id: "4138",
                        text: "电器",
                        children: [
                            {
                                id: "4441",
                                text: "电池",
                                children: [
                                    {
                                        id: "5720",
                                        text: "可充电电池",
                                        children: [],
                                        leaf: true
                                    },
                                    {
                                        id: "5721",
                                        text: "可充电/变压器",
                                        children: [],
                                        leaf: true
                                    },
                                    {
                                        id: "5722",
                                        text: "7号电池",
                                        children: [],
                                        leaf: true
                                    },
                                    {
                                        id: "5723",
                                        text: "5号电池",
                                        children: [],
                                        leaf: true
                                    },
                                    {
                                        id: "5724",
                                        text: "2号电池",
                                        children: [],
                                        leaf: true
                                    },
                                    {
                                        id: "5725",
                                        text: "1号电池",
                                        children: [],
                                        leaf: true
                                    },
                                    {
                                        id: "5726",
                                        text: "9V电池",
                                        children: [],
                                        leaf: true
                                    },
                                    {
                                        id: "5727",
                                        text: "特种电池",
                                        children: [],
                                        leaf: true
                                    }
                                ],
                                leaf: false
                            },
                            {
                                id: "4442",
                                text: "便携式灯具",
                                children: [
                                    {
                                        id: "5728",
                                        text: "手电筒",
                                        children: [],
                                        leaf: true
                                    },
                                    {
                                        id: "5729",
                                        text: "应急灯",
                                        children: [],
                                        leaf: true
                                    }
                                ],
                                leaf: false
                            },
                            {
                                id: "4443",
                                text: "灯泡",
                                children: [
                                    {
                                        id: "5730",
                                        text: "标准灯泡",
                                        children: [],
                                        leaf: true
                                    },
                                    {
                                        id: "5731",
                                        text: "蘑菇灯泡",
                                        children: [],
                                        leaf: true
                                    },
                                    {
                                        id: "5732",
                                        text: "球型灯泡",
                                        children: [],
                                        leaf: true
                                    },
                                    {
                                        id: "5733",
                                        text: "烛型灯泡",
                                        children: [],
                                        leaf: true
                                    },
                                    {
                                        id: "5734",
                                        text: "管状灯泡",
                                        children: [],
                                        leaf: true
                                    },
                                    {
                                        id: "5735",
                                        text: "卤素灯泡/管",
                                        children: [],
                                        leaf: true
                                    },
                                    {
                                        id: "5736",
                                        text: "节能灯泡/管",
                                        children: [],
                                        leaf: true
                                    },
                                    {
                                        id: "5737",
                                        text: "日光灯管/环型灯管",
                                        children: [],
                                        leaf: true
                                    },
                                    {
                                        id: "5738",
                                        text: "夜灯",
                                        children: [],
                                        leaf: true
                                    }
                                ],
                                leaf: false
                            },
                            {
                                id: "4444",
                                text: "灯架",
                                children: [
                                    {
                                        id: "5739",
                                        text: "短日光灯架",
                                        children: [],
                                        leaf: true
                                    },
                                    {
                                        id: "5740",
                                        text: "长日光灯架",
                                        children: [],
                                        leaf: true
                                    },
                                    {
                                        id: "5741",
                                        text: "日光灯配件",
                                        children: [],
                                        leaf: true
                                    }
                                ],
                                leaf: false
                            },
                            {
                                id: "4445",
                                text: "灯具",
                                children: [
                                    {
                                        id: "5742",
                                        text: "装饰灯",
                                        children: [],
                                        leaf: true
                                    },
                                    {
                                        id: "5743",
                                        text: "书写台灯",
                                        children: [],
                                        leaf: true
                                    },
                                    {
                                        id: "5744",
                                        text: "夹子灯",
                                        children: [],
                                        leaf: true
                                    },
                                    {
                                        id: "5745",
                                        text: "落地灯",
                                        children: [],
                                        leaf: true
                                    },
                                    {
                                        id: "5746",
                                        text: "壁灯",
                                        children: [],
                                        leaf: true
                                    },
                                    {
                                        id: "5747",
                                        text: "顶灯",
                                        children: [],
                                        leaf: true
                                    },
                                    {
                                        id: "5748",
                                        text: "吊灯",
                                        children: [],
                                        leaf: true
                                    },
                                    {
                                        id: "5749",
                                        text: "灯罩",
                                        children: [],
                                        leaf: true
                                    }
                                ],
                                leaf: false
                            },
                            {
                                id: "4446",
                                text: "电器配件",
                                children: [
                                    {
                                        id: "5750",
                                        text: "电工器材",
                                        children: [],
                                        leaf: true
                                    },
                                    {
                                        id: "5751",
                                        text: "延长线",
                                        children: [],
                                        leaf: true
                                    },
                                    {
                                        id: "5752",
                                        text: "插座",
                                        children: [],
                                        leaf: true
                                    },
                                    {
                                        id: "5753",
                                        text: "插头",
                                        children: [],
                                        leaf: true
                                    },
                                    {
                                        id: "5754",
                                        text: "灯座",
                                        children: [],
                                        leaf: true
                                    },
                                    {
                                        id: "5755",
                                        text: "开关",
                                        children: [],
                                        leaf: true
                                    },
                                    {
                                        id: "5756",
                                        text: "墙盒",
                                        children: [],
                                        leaf: true
                                    },
                                    {
                                        id: "5757",
                                        text: "分线箱",
                                        children: [],
                                        leaf: true
                                    },
                                    {
                                        id: "5758",
                                        text: "门铃",
                                        children: [],
                                        leaf: true
                                    }
                                ],
                                leaf: false
                            },
                            {
                                id: "4447",
                                text: "保护设备",
                                children: [
                                    {
                                        id: "5759",
                                        text: "保险丝",
                                        children: [],
                                        leaf: true
                                    },
                                    {
                                        id: "5760",
                                        text: "漏电保护器",
                                        children: [],
                                        leaf: true
                                    }
                                ],
                                leaf: false
                            },
                            {
                                id: "4448",
                                text: "影视配件",
                                children: [
                                    {
                                        id: "5761",
                                        text: "视频线",
                                        children: [],
                                        leaf: true
                                    },
                                    {
                                        id: "5762",
                                        text: "音频线",
                                        children: [],
                                        leaf: true
                                    },
                                    {
                                        id: "5763",
                                        text: "分频器",
                                        children: [],
                                        leaf: true
                                    }
                                ],
                                leaf: false
                            },
                            {
                                id: "4449",
                                text: "电线/电缆",
                                children: [
                                    {
                                        id: "5764",
                                        text: "单芯线",
                                        children: [],
                                        leaf: true
                                    },
                                    {
                                        id: "5765",
                                        text: "二芯线",
                                        children: [],
                                        leaf: true
                                    },
                                    {
                                        id: "5766",
                                        text: "三芯线",
                                        children: [],
                                        leaf: true
                                    },
                                    {
                                        id: "5767",
                                        text: "延长线",
                                        children: [],
                                        leaf: true
                                    },
                                    {
                                        id: "5768",
                                        text: "室内电话线",
                                        children: [],
                                        leaf: true
                                    },
                                    {
                                        id: "5769",
                                        text: "电话听筒线",
                                        children: [],
                                        leaf: true
                                    },
                                    {
                                        id: "5770",
                                        text: "电线夹头",
                                        children: [],
                                        leaf: true
                                    },
                                    {
                                        id: "5771",
                                        text: "音箱线",
                                        children: [],
                                        leaf: true
                                    },
                                    {
                                        id: "5772",
                                        text: "宽频线",
                                        children: [],
                                        leaf: true
                                    },
                                    {
                                        id: "5773",
                                        text: "网络线",
                                        children: [],
                                        leaf: true
                                    }
                                ],
                                leaf: false
                            },
                            {
                                id: "4450",
                                text: "代销灯具",
                                children: [
                                    {
                                        id: "5774",
                                        text: "代销灯具",
                                        children: [],
                                        leaf: true
                                    }
                                ],
                                leaf: false
                            }
                        ],
                        leaf: false
                    },
                    {
                        id: '4044',
                        text: '折扣',
                        children: [
                            {
                                id: '4051',
                                text: '折扣系列',
                                children: [
                                    {
                                        id: '4080',
                                        text: '去分折扣系列',
                                        children: [
                                            {
                                                id: '4255',
                                                text: '系统去分折扣',
                                                children: [
                                                    {
                                                        id: '4964',
                                                        text: '收银去分折扣',
                                                        children: [

                                                        ],
                                                        leaf: true
                                                        
                                                    }
                                                ],
                                                leaf: false
                                            }
                                        ],
                                        leaf: false
                                    },
                                    {
                                        id: '4081',
                                        text: '外部折扣系列',
                                        children: [
                                            {
                                                id: '4256',
                                                text: '外部折扣券',
                                                children: [
                                                    {
                                                        id: '4965',
                                                        text: '索迪斯折扣',
                                                        children: [

                                                        ],
                                                        leaf: true
                                                    }
                                                ],
                                                leaf: false
                                            }
                                        ],
                                        leaf: false
                                    }
                                ],
                                leaf: false
                            }
                        ],
                        leaf: false
                    },
                    {
                        id: '4050',
                        text: '特卖团购',
                        children: [
                            {
                                id: '4077',
                                text: '特卖',
                                children: [
                                    {
                                        id: '4249',
                                        text: '特卖食品',
                                        leaf: true
                                    },
                                    {
                                        id: '4250',
                                        text: '特卖非食品',
                                        leaf: true
                                    }
                                ],
                                leaf: false
                            },
                            {
                                id: '4078',
                                text: '团购',
                                children: [
                                    {
                                        id: '4251',
                                        text: '团购食品',
                                        leaf: true
                                    },
                                    {
                                        id: '4252',
                                        text: '团购非食品',
                                        leaf: true
                                    }
                                ],
                                leaf: false
                            },
                            {
                                id: '4079',
                                text: '其他',
                                children: [
                                    {
                                        id: '4253',
                                        text: '其他食品',
                                        leaf: true
                                    },
                                    {
                                        id: '4254',
                                        text: '其他非食品',
                                        leaf: true
                                    }
                                ],
                                leaf: false
                            }
                        ],
                        leaf: false
                    }
                ]
            }
        }, cfg)]);
    }
});