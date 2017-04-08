var express = require('express');
var router = express.Router();//定义router获取Router()方法库
var Bulletin = require('../models/bulletin');//定义Bulletin获取之前建立的Bulletin数据模型

//获取请求中的body部分，由此新建bulletin，添加到数据库中，数据库存储数据成功则返回数据，否则便报错
router.post("/", function(req, res, next){
	var bulletin = req.body;
	Bulletin.create(bulletin, function(err, bulletin){
		if (err) {
			return res.status(400).send("err in post /bulletin");
		} else {
			return res.status(200).json(bulletin);
		}
	});
});

//遍历数据库，取出数据存入bulletins中并返回
router.get("/", function(req, res, next){
	Bulletin.find({}, function(err, bulletins){
		if(err){
			return res.status(400).send("err in get /bulletin");
		}else{
			console.log(bulletins);
			return res.status(200).json(bulletins);
		}
	})
});

module.exports = router;