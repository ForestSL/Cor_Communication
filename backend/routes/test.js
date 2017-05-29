var express = require('express');
var router = express.Router();//定义router获取Router()方法库
var Test = require('../models/test');

router.post("/", function(req, res, next){//req
	var test = req.body;

	
			Test.create(test, function(err, test){
				if (err) {
					return res.status(400).send("err in post /test");
				} else {
					return res.status(200).json("success");//res
				}
			})
 	
	
 	
});

router.get("/", function(req, res, next){//无参数
	Test.find({}, function(err, tests){
		if(err){
			return res.status(400).send("err in get /test");
		}else{
			console.log(tests);
			return res.status(200).json(tests);//res:返回所有公告
		}
	})
});

router.post("/delete", function(req, res, next){//req:公告时间
	var test=req.body;
	Test.remove({ }, function(err, tests){
		if(err){
			return res.status(400).send("err in post /test/delete");
		}else{
			console.log("删除成功");
			return res.status(200).json("success");//res
		}
	})
});

module.exports = router;