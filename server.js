/**
 * Created by jiangyu on 2017/4/16.
 */

// 搭建node服务器
var express = require('express')
var app = express()
var bodyParser = require('body-parser');
var  serviceApp  = require('./data_base/serviceDB')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 默认返回对象
var response = function () {
    code = 1;
    msg = "ok";
    body = {};
};

// 接口：测试
app.get('/', function (req, res) {
    res.send('Hello World')
})
app.post('/test', function (req, res) {
    console.log("test参数:"+JSON.stringify(req.body))

    var body = {
        "HomeMainViewController": {
            "redBagAction": "9999999"
        }
    };
    var obj = new response();
    obj.code = 1;
    obj.msg = "接口地址："+req.url;
    obj.body = body;
    res.send(JSON.stringify(obj))
})
// 接口：上传埋点
app.post('/appStatistics/clickAction', function (req, res, next) {
    console.log('埋点数据->'+req.body.body);
    serviceApp.insert('77', '3','4.9.4'.version,req.body.body.list, function (callback) {
        if (callback == 200) {
            var obj = new response();
            obj.code = 1;
            obj.msg = "ok";
            return res.end(JSON.stringify(obj));
        } else {
            var obj = new response();
            obj.code = 999;
            obj.msg = "数据库操作失败";
            return res.end(JSON.stringify(obj));
        }
    });
});

app.post('/appStatistics/getPoints', function (req, res) {
    serviceApp.selectAllData(function (callback) {
        return res.end(callback);
    });
});

// 接口：获取ios埋点配置json
app.post('/appStatistics/getPlist', function (req, res) {
    console.log('app获取plistjson');
    var obj = {
        "HomeMainViewController": {
            "redBagAction": "9999999"
        }
    };
    return res.end(JSON.stringify(obj));
});

//凡普大通接口
//登录接口
app.post('/finupDT/login', function (req, res) {
    console.log('登录接口'+JSON.stringify(req.body));
    serviceApp.login(req.body, function(callback) {
        console.log('登录sql结果'+JSON.stringify(callback));
        var obj = new response();
        if (callback.code == 1) {
            if (callback.body) {
                var user = callback.body;
                if (user.phone == req.body.phone && user.password == req.body.password) {
                    obj.code = 1;
                    obj.msg = "登录成功";
                    obj.body = user;
                } else {
                    obj.code = -2;
                    obj.msg = "密码错误";
                }
            } else {
                obj.code = -1;
                obj.msg = "用户不存在";
            }
            return res.end(JSON.stringify(obj));
        } else {
            obj.code = 999;
            obj.msg = "服务异常";
            return res.end(JSON.stringify(obj));
        }
    });
});

//我的积分
app.post('/finupDT/myCards', function (req, res) {
    console.log('我的积分接口'+JSON.stringify(req.body));
    serviceApp.myCards(req.body, function(callback) {
        console.log('sql结果'+JSON.stringify(callback));
        var obj = new response();
        if (callback.code == 1) {
            if (callback.body) {
                obj.code = 1;
                obj.body = callback.body;
            } else {
                obj.code = -1;
                obj.msg = "请求失败";
            }
            return res.end(JSON.stringify(obj));
        } else {
            obj.code = 999;
            obj.msg = "服务异常";
            return res.end(JSON.stringify(obj));
        }
    });
});

//积分流水
app.post('/finupDT/cardBill', function (req, res) {
    console.log('积分流水接口'+JSON.stringify(req.body));
    var billModel = new Object();
    serviceApp.myCards(req.body, function(callback) {
        console.log('sql结果1'+JSON.stringify(callback));
        var obj = new response();
        if (callback.code == 1 && callback.body) {
            var myCard = callback.body;
            billModel.yellowNum = myCard.yellowNum;
            billModel.blueNum = myCard.blueNum;
            billModel.finupNum = myCard.finupNum;
            console.log('我的卡片'+JSON.stringify(myCard));
            serviceApp.cardBill(1, req.body.userId, function(callback) {
                // console.log('sql结果2'+JSON.stringify(callback));
                if (callback.code == 1 && callback.body) {
                    billModel.yellowList = callback.body;
                    billModel.billList = req.body.cardType == 1 ? callback.body : billModel.billList;
                    serviceApp.cardBill(2, req.body.userId, function(callback) {
                        // console.log('sql结果3'+JSON.stringify(callback));
                        if (callback.code == 1 && callback.body) {
                            billModel.blueList = callback.body;
                            billModel.billList = req.body.cardType == 2 ? callback.body : billModel.billList;
                            serviceApp.cardBill(3, req.body.userId, function(callback) {
                                // console.log('sql结果4'+JSON.stringify(callback));
                                if (callback.code == 1 && callback.body) {
                                    billModel.finupList = callback.body;
                                    billModel.billList = req.body.cardType == 3 ? callback.body : billModel.billList;
                                    obj.code = 1;
                                    obj.body = billModel;
                                    return res.end(JSON.stringify(obj));
                                } else {
                                    obj.code = -1;
                                    obj.msg = "请求失败4";
                                    return res.end(JSON.stringify(obj));
                                }
                            });
                        } else {
                            obj.code = -1;
                            obj.msg = "请求失败3";
                            return res.end(JSON.stringify(obj));
                        }
                    });
                } else {
                    obj.code = -1;
                    obj.msg = "请求失败2";
                    return res.end(JSON.stringify(obj));
                }
            });
        } else {
            obj.code = -1;
            obj.msg = "请求失败1";
            return res.end(JSON.stringify(obj));
        }
    });


});

//积分市场
app.post('/finupDT/cardMarket', function (req, res) {
    console.log('积分市场接口'+JSON.stringify(req.body));
    var resMap = {};
    serviceApp.myCards(req.body, function(callback) {
        console.log('sql结果'+JSON.stringify(callback));
        var obj = new response();
        if (callback.code == 1) {
            resMap.myCards = callback.body; //我的积分
            serviceApp.cardMarket(true, req.body.userId, function(callback) {
                console.log('sql结果'+JSON.stringify(callback));
                if (callback.code == 1) {
                    if (callback.body) {
                        resMap['mySellList'] = callback.body;
                        console.log("mySellList"+JSON.stringify(callback.body));
                        serviceApp.cardMarket(false, req.body.userId, function(callback) {
                            console.log("sellList"+JSON.stringify(callback.body));
                            resMap['sellList'] = callback.body;
                            obj.code = 1;
                            obj.body = resMap;
                            return res.end(JSON.stringify(obj));
                        });
                    } else {
                        obj.code = -1;
                        obj.msg = "请求失败";
                        return res.end(JSON.stringify(obj));
                    }
                } else {
                    obj.code = -1;
                    obj.msg = "请求失败";
                    return res.end(JSON.stringify(obj));
                }
            });
        } else {
            obj.code = -1;
            obj.msg = "请求失败";
            return res.end(JSON.stringify(obj));
        }
    });
});

//发布一个积分交易
app.post('/finupDT/sellCard', function (req, res) {
    console.log('发布积分交易接口'+JSON.stringify(req.body));
    serviceApp.sellCard(req.body, function(callback) {
        console.log('sql结果'+JSON.stringify(callback));
        var obj = new response();
        if (callback.code == 1) {
            if (callback.body) {
                obj.code = 1;
                obj.msg = "发布成功";
            } else {
                obj.code = -1;
                obj.msg = "发布失败";
            }
            return res.end(JSON.stringify(obj));
        } else {
            obj.code = 999;
            obj.msg = "服务异常";
            return res.end(JSON.stringify(obj));
        }
    });
});

//取消一个积分交易
app.post('/finupDT/cancelCard', function (req, res) {
    console.log('取消积分交易接口'+JSON.stringify(req.body));
    var obj = new response();
    serviceApp.selectCardRecord(req.body.marketId, function (callback) {
        if (callback.code == 1 && callback.body) {
            var marketRecord = callback.body;
            console.log('marketRecord::'+JSON.stringify(marketRecord));
            if (marketRecord.userId == req.body.userId) {
                serviceApp.deleteCardRecord(req.body.marketId, function(callback) {
                    console.log('sql结果'+JSON.stringify(callback));
                    if (callback.code == 1) {
                        obj.code = 1;
                        obj.msg = "取消成功";
                        return res.end(JSON.stringify(obj));
                    }
                });
            } else {
                obj.code = -1;
                obj.msg = "此交易不是由你发布";
                return res.end(JSON.stringify(obj));
            }
        } else {
            obj.code = -1;
            obj.msg = "取消失败";
            return res.end(JSON.stringify(obj));
        }
    });
});

//购买积分
app.post('/finupDT/buyCard', function (req, res) {
    console.log('购买积分接口'+JSON.stringify(req.body));
    var obj = new response();
    if (req.body.marketId == null || req.body.marketId < 0 || req.body.userId == null || req.body.userId < 0) {
        obj.code = -1;
        obj.msg = "参数错误";
        return res.end(JSON.stringify(obj));
    }
    //第1步：查找对应的交易记录
    serviceApp.selectCardRecord(req.body.marketId, function (callback) {
        if (callback.code == 1 && callback.body) {
            var marketRecord = callback.body;
            console.log('marketRecord::'+JSON.stringify(marketRecord));

            //第2步：插入一条卖家积分流水
            var sellerCards = getTransactCards(null, marketRecord);
            serviceApp.insertCard(sellerCards, function(callback) {
                if (callback.code == 1) {
                    //第3步：插入一条买家积分流水
                    var buyerCards = getTransactCards(req.body.userId, marketRecord);
                    serviceApp.insertCard(buyerCards, function(callback) {
                        if (callback.code == 1) {
                            //第4步：删除这条交易记录
                            serviceApp.deleteCardRecord(req.body.marketId, function(callback) {
                                if (callback.code == 1) {
                                    obj.code = 1;
                                    obj.msg = "购买成功";
                                } else {
                                    obj.code = -1;
                                    obj.msg = "购买失败4";
                                }
                                return res.end(JSON.stringify(obj));
                            });
                        } else {
                            obj.code = -1;
                            obj.msg = "购买失败3";
                            return res.end(JSON.stringify(obj));
                        }
                    });
                } else {
                    obj.code = -1;
                    obj.msg = "购买失败2";
                    return res.end(JSON.stringify(obj));
                }
            });
        } else {
            obj.code = -1;
            obj.msg = "购买失败1";
            return res.end(JSON.stringify(obj));
        }
    });
});

//私有方法：计算交易卡片 A卖给B（3黄换2蓝）：A-3黄+2蓝币  B+3黄-2蓝币
function getTransactCards(buyerId, marketRecord) {
    var cardbill = new Object();
    //卖黄币买蓝币
    if (marketRecord.sellYellowNum > 0) {
        if (buyerId && buyerId > 0) {
            //买家
            cardbill.userId = buyerId;
            cardbill.yellowCard = marketRecord.sellYellowNum;
            cardbill.blueCard = -marketRecord.buyBlueNum;
            cardbill.source = "交易兑换";
        } else {
            //卖家
            cardbill.userId = marketRecord.userId;
            cardbill.yellowCard = -marketRecord.sellYellowNum;
            cardbill.blueCard = marketRecord.buyBlueNum;
            cardbill.source = "交易兑换";
        }
    } else {
        if (buyerId && buyerId > 0) {
            //买家
            cardbill.userId = buyerId;
            cardbill.yellowCard = -marketRecord.buyYellowNum;
            cardbill.blueCard = marketRecord.sellBlueNum;
            cardbill.source = "交易兑换";
        } else {
            //卖家
            cardbill.userId = marketRecord.userId;
            cardbill.yellowCard = marketRecord.buyYellowNum;
            cardbill.blueCard = -marketRecord.sellBlueNum;
            cardbill.source = "交易兑换";
        }
    }
    return cardbill;
}

//兑换凡普币
app.post('/finupDT/buyFinupCard', function (req, res) {
    console.log('兑换凡普币接口'+JSON.stringify(req.body));
    if (req.body.yellowCard == req.body.blueCard) {
        var cardbill = new Object();
        cardbill.userId = req.body.userId;
        cardbill.yellowCard = -req.body.yellowCard;
        cardbill.blueCard = -req.body.blueCard;
        cardbill.finupCard = req.body.yellowCard;
        cardbill.source = "交易兑换";
        serviceApp.insertCard(cardbill, function(callback) {
            var obj = new response();
            if (callback.code == 1) {
                obj.code = 1;
                obj.msg = "兑换成功";
            } else {
                obj.code = -1;
                obj.msg = "兑换失败";
            }
            return res.end(JSON.stringify(obj));
        });
    }
});

//商品列表
app.post('/finupDT/productMarket', function (req, res) {
    console.log('积分市场接口'+JSON.stringify(req.body));
    serviceApp.myCards(req.body, function(callback) {
        console.log('sql结果'+JSON.stringify(callback));
        var obj = new response();
        if (callback.code == 1) {
            var myCards = callback.body; //我的积分
            serviceApp.productMarket(req.body, function(callback) {
                console.log('sql结果'+JSON.stringify(callback));
                if (callback.code == 1) {
                    if (callback.body) {
                        var resMap = new Object();
                        resMap.myCards = myCards;
                        resMap.productList = callback.body;
                        obj.code = 1;
                        obj.body = resMap;
                    } else {
                        obj.code = -1;
                        obj.msg = "请求失败";
                    }
                    return res.end(JSON.stringify(obj));
                } else {
                    obj.code = 999;
                    obj.msg = "服务异常";
                    return res.end(JSON.stringify(obj));
                }
            });
        } else {
            obj.code = -1;
            obj.msg = "请求失败";
            return res.end(JSON.stringify(obj));
        }
    });
});

//购买商品
app.post('/finupDT/buyProduct', function (req, res) {
    console.log('购买产品接口'+JSON.stringify(req.body));
    var cardbill = new Object();
    cardbill.userId = req.body.userId;
    cardbill.finupCard = -req.body.finupCard;
    cardbill.source = "购买产品";
    var obj = new response();
    serviceApp.insertCard(cardbill, function(callback) {
        if (callback.code == 1) {
            serviceApp.selectProduct(req.body.productId, function (callback) {
                if (callback.code == 1 && callback.body) {
                    var product = callback.body;
                    console.log('h的互动'+JSON.stringify(product.number)+"gh"+JSON.stringify(req.body.finupCard));
                    let remain = product.number - 1;
                    serviceApp.updateProduct(req.body.productId, remain, function(callback) {
                        if (callback.code == 1) {
                            obj.code = 1;
                            obj.msg = "购买成功";
                            return res.end(JSON.stringify(obj));
                        } else {
                            obj.code = -1;
                            obj.msg = "购买失败3";
                            return res.end(JSON.stringify(obj));
                        }
                    });
                } else {
                    obj.code = -1;
                    obj.msg = "购买失败2";
                    return res.end(JSON.stringify(obj));
                }
            });
        } else {
            obj.code = -1;
            obj.msg = "购买失败1";
            return res.end(JSON.stringify(obj));
        }
    });
});

// 创建服务
app.listen(process.env.PORT || 5050, function (e) {
    console.log("服务器构建成功:http://localhost:5050/");
})