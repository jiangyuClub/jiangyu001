var mysql = require('mysql');
var config = require('../config');

var pool = mysql.createPool({
    host : config.db_host,
    port : config.db_port,
    user : config.username,
    password : config.password,
    database : config.db_name
});

var DB = {};
module.exports = DB;

DB.query=function(sql,callback){
    console.log(sql);
    pool.getConnection(function(err,conn){
        if(err){
            callback(err,null,null);
        }else{
            conn.query(sql,function(qerr,vals,fields){
                //释放连接
                conn.release();
                //事件驱动回调
                callback(qerr,vals);
            });
        }
    });
};

//事务连接
DB.getConnection=function(callback){
    var connection=mysql.createConnection(option);
    connection.connect(function(err){
        if(err){
            console.error('error connecting: ' + err.stack);
        }
        callback(err,connection);
    });
}