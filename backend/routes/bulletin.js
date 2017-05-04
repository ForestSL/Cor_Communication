var express = require('express');
var router = express.Router();//定义router获取Router()方法库
var Bulletin = require('../models/bulletin');//定义Bulletin获取之前建立的Bulletin数据模型

//新建公告：管理员
router.post("/", function(req, res, next){//req:部门名称、公告名称、公告内容、时间
	var bulletin = req.body;
	Bulletin.create(bulletin, function(err, bulletin){
		if (err) {
			return res.status(400).send("err in post /bulletin");
		} else {
			return res.status(200).json("success");//res
		}
	});
});

//返回所有公告：管理员
router.get("/", function(req, res, next){//无参数
	Bulletin.find({}, function(err, bulletins){
		if(err){
			return res.status(400).send("err in get /bulletin");
		}else{
			console.log(bulletins);
			return res.status(200).json(bulletins);//res:返回所有公告
		}
	})
});

//查找公告：用户
router.post("/search", function(req, res, next){//req:部门ID
	var bulletin = req.body;
	Bulletin.find({ departName: bulletin.departName}, function(err, bulletins){
		if(err){
			return res.status(400).send("err in get /bulletin");
		}else{
			console.log(bulletins);
			return res.status(200).json(bulletins);//res:返回该部门现有公告
		}
	})
});

//删除公告：管理员
router.post("/delete", function(req, res, next){//req:公告时间
	var bulletin = req.body;
	Bulletin.remove({ time: bulletin.time }, function(err, bulletins){
		if(err){
			return res.status(400).send("err in get /bulletin");
		}else{
			console.log("删除成功");
			return res.status(200).json("success");//res
		}
	})
});

module.exports = router;