var express = require('express');
var router = express.Router();//定义router获取Router()方法库
var Depart = require('../models/depart');//定义Depart获取之前建立的Depart数据模型

//获取请求中的body部分，由此新建depart，添加到数据库中，数据库存储数据成功则返回数据，否则便报错
router.post("/", function(req, res, next){
	var depart = req.body;
	Depart.create(depart, function(err, depart){
		if (err) {
			return res.status(400).send("err in post /depart");
		} else {
			return res.status(200).json(depart);
		}
	});
});

//遍历数据库，取出数据存入departs中并返回
router.get("/", function(req, res, next){
	Depart.find({}, function(err, departs){
		if(err){
			return res.status(400).send("err in get /depart");
		}else{
			console.log(departs);
			return res.status(200).json(departs);
		}
	})
});

module.exports = router;