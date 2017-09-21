var db = require('./dbhelper');

function serviceApp() {
}
module.exports = serviceApp;

// 默认返回对象
var response = function () {
    code = 1;
    body = {};
};

serviceApp.selectAllData = function (callback) {
    var sql = 'select * from app_display_counts;';
    db.query(sql, function (err, rows, fiels) {
        console.log(JSON.stringify(rows));
        if (err) {
            console.error('用户行为表获取失败');
            callback('999');
        } else {
            callback(JSON.stringify(rows));
        }
    });
};

serviceApp.insert = function (us,client_type,version, users, callback) {
    console.log(users);
    users.forEach(function (json) {
        var sql;
        if (json.actionType == 1) {   //用户行为表
            sql = "INSERT INTO app_display_counts set user_id='" + json.userId + "',page_id='" + json.pageId + "',pid='" + json.pid + "',client_type='" + client_type + "',action_time='" + json.actionTime + "',exit_time='" + json.exitTime
                + "',date_id='" + json.date_id + "',app_version='" + version + "',ip='" + json.ip + "',net_type='" + json.netType + "',operator='" + json.operator + "',device_type='" + json.deviceType + "',us='" + us + "',act='" + json.act
                + "',lab='" + json.lab + "',val='" + json.val + "',action_type='" + json.actionType + "';";
            db.query(sql, function (err, rows, fiels) {
                if (err) {
                    console.error('插入用户行为表失败');
                    callback('999');
                } else {
                    callback('200');
                }
            });
        } else { //用户点击表
            sql = "INSERT INTO app_click_counts set  user_id='" + json.userId + "',page_id='" + json.pageId + "',pid='" + json.pid + "',client_type='" + client_type + "',action_time='" + json.actionTime + "',exit_time='" + json.exitTime
                + "',date_id='" + json.date_id + "',app_version='" + version + "',ip='" + json.ip + "',net_type='" + json.netType + "',operator='" + json.operator + "',device_type='" + json.deviceType + "',us='" + us + "',act='" + json.act
                + "',lab='" + json.lab + "',val='" + json.val + "',action_type='" + json.actionType + "';";


            db.query(sql, function (err, rows, fiels) {
                if (err) {
                    console.error('插入用户行为表失败');
                    callback('999');
                } else {
                    callback('200');
                }
            });
        }
    });
    // callback('200');
};





//登录
serviceApp.login = function (user, callback) {
    var sql = "select * from finupdt_user where phone="+user.phone+";";
    db.query(sql, function (err, rows) {
        console.log("登录sql信息"+JSON.stringify(rows));
        var obj = new response();
        if (err) {
            obj.code = -1;
        } else {
            obj.code = 1;
            obj.body = rows.length > 0 ? rows[0] : null;
        }
        callback(obj);
    });
};

//我的积分
serviceApp.myCards = function (user, callback) {
    var sql = "select sum(yellowCard) as yellowNum, sum(blueCard) as blueNum, sum(finupCard) as finupNum from finupdt_card_bill where userId="+user.userId+";";
    db.query(sql, function (err, rows) {
        console.log("sql信息"+JSON.stringify(rows));
        var obj = new response();
        if (err) {
            obj.code = -1;
        } else {
            obj.code = 1;
            obj.body = rows.length > 0 ? rows[0] : null;
        }
        callback(obj);
    });
};

//积分流水
serviceApp.cardBill = function (cardType, userId, callback) {
    var sql
    switch (cardType) {
        case 1: {
            sql = "select * from finupdt_card_bill where userId="+userId+" and yellowCard!=0 order by update_time DESC;";
        }
        break;
        case 2: {
            sql = "select * from finupdt_card_bill where userId="+userId+" and blueCard!=0 order by update_time DESC;";
        }
            break;
        case 3: {
            sql = "select * from finupdt_card_bill where userId="+userId+" and finupCard!=0 order by update_time DESC;";
        }
            break;
        default: {
            sql = "select * from finupdt_card_bill where userId="+userId+" order by update_time DESC;";
        }
            break;
    }
    db.query(sql, function (err, rows) {
        // console.log("sql信息"+JSON.stringify(rows));
        var obj = new response();
        if (err) {
            obj.code = -1;
        } else {
            obj.code = 1;
            obj.body = rows;
        }
        callback(obj);
    });
};

//插入一条积分流水
serviceApp.insertCard = function (terms, callback) {
    var sql = "INSERT INTO finupdt_card_bill set userId="+terms.userId+"";
    if (terms.yellowCard) {
        sql += ",yellowCard="+terms.yellowCard+""
    }
    if (terms.blueCard) {
        sql += ",blueCard="+terms.blueCard+""
    }
    if (terms.finupCard) {
        sql += ",finupCard="+terms.finupCard+""
    }
    if (terms.source) {
        sql += ",source='"+terms.source+"'"
    }
    sql += ";";
    db.query(sql, function (err, rows) {
        console.log("sql信息"+JSON.stringify(rows));
        var obj = new response();
        if (err) {
            obj.code = -1;
        } else {
            obj.code = 1;
        }
        callback(obj);
    });
};


//积分市场
serviceApp.cardMarket = function (isMySell, userId, callback) {
    var sql;
    if (isMySell) {
        sql = "SELECT finupdt_card_market.id, finupdt_card_market.userId, finupdt_card_market.sellYellowNum, finupdt_card_market.sellBlueNum, finupdt_card_market.buyYellowNum, finupdt_card_market.buyBlueNum, finupdt_card_market.update_time, finupdt_user.phone, finupdt_user.nickname  FROM finupdt_card_market INNER JOIN finupdt_user ON finupdt_card_market.userId = finupdt_user.id and finupdt_card_market.userId="+userId+" order by finupdt_card_market.update_time DESC;";
    } else {
        sql = "SELECT finupdt_card_market.id, finupdt_card_market.userId, finupdt_card_market.sellYellowNum, finupdt_card_market.sellBlueNum, finupdt_card_market.buyYellowNum, finupdt_card_market.buyBlueNum, finupdt_card_market.update_time, finupdt_user.phone, finupdt_user.nickname  FROM finupdt_card_market INNER JOIN finupdt_user ON finupdt_card_market.userId = finupdt_user.id and finupdt_card_market.userId!="+userId+" order by finupdt_card_market.update_time DESC;";
    }
    db.query(sql, function (err, rows) {
        console.log("sql信息"+JSON.stringify(rows));
        var obj = new response();
        if (err) {
            obj.code = -1;
        } else {
            obj.code = 1;
            obj.body = rows;
        }
        callback(obj);
    });
};

//发布积分交易
serviceApp.sellCard = function (terms, callback) {
    var sql = "INSERT INTO finupdt_card_market set userId="+terms.userId+"";
    if (terms.sellYellowNum) {
        sql += ",sellYellowNum="+terms.sellYellowNum+""
    }
    if (terms.sellBlueNum) {
        sql += ",sellBlueNum="+terms.sellBlueNum+""
    }
    if (terms.buyYellowNum) {
        sql += ",buyYellowNum="+terms.buyYellowNum+""
    }
    if (terms.buyBlueNum) {
        sql += ",buyBlueNum="+terms.buyBlueNum+""
    }
    if (terms.nickname) {
        sql += ",nickname='"+terms.nickname+"'"
    }
    if (terms.phone) {
        sql += ",phone="+terms.phone+""
    }
    sql += ";";
    db.query(sql, function (err, rows) {
        console.log("sql信息"+JSON.stringify(rows));
        var obj = new response();
        if (err) {
            obj.code = -1;
        } else {
            obj.code = 1;
            obj.body = rows;
        }
        callback(obj);
    });
};

//查询一条积分交易
serviceApp.selectCardRecord = function (marketId, callback) {
    var sql = "select * from finupdt_card_market where id="+marketId+";";
    db.query(sql, function (err, rows) {
        console.log("sql信息"+JSON.stringify(rows));
        var obj = new response();
        if (err) {
            obj.code = -1;
        } else {
            obj.code = 1;
            obj.body = rows.length > 0 ? rows[0] : null;
        }
        callback(obj);
    });
};

//删除一条积分交易
serviceApp.deleteCardRecord = function (marketId, callback) {
    var sql = "delete from finupdt_card_market where id="+marketId+";";
    db.query(sql, function (err, rows) {
        console.log("sql信息"+JSON.stringify(rows));
        var obj = new response();
        if (err) {
            obj.code = -1;
        } else {
            obj.code = 1;
        }
        callback(obj);
    });
};

//商品市场
serviceApp.productMarket = function (terms, callback) {
    var sql = "select * from finupdt_product;";
    db.query(sql, function (err, rows) {
        console.log("sql信息"+JSON.stringify(rows));
        var obj = new response();
        if (err) {
            obj.code = -1;
        } else {
            obj.code = 1;
            obj.body = rows;
        }
        callback(obj);
    });
};

//获取商品
serviceApp.selectProduct = function (productId, callback) {
    var sql = "select * from finupdt_product where id="+productId+";";
    db.query(sql, function (err, rows) {
        console.log("sql信息"+JSON.stringify(rows));
        var obj = new response();
        if (err) {
            obj.code = -1;
        } else {
            obj.code = 1;
            obj.body = rows.length > 0 ? rows[0] : null;
        }
        callback(obj);
    });
};

//更新产品信息
serviceApp.updateProduct = function (productId, number, callback) {
    var sql = "update finupdt_product set number="+number+" where id="+productId+";";
    db.query(sql, function (err, rows) {
        console.log("sql信息"+JSON.stringify(rows));
        var obj = new response();
        if (err) {
            obj.code = -1;
        } else {
            obj.code = 1;
        }
        callback(obj);
    });
};