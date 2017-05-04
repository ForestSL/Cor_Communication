var express = require('express');
var router = express.Router();//定义router获取Router()方法库
var Admin = require('../models/admin');//定义User获取之前建立的User数据模型

router.post("/", function(req, res, next){//req:
	var admin = req.body;
	Admin.create(admin, function(err, admin){
		if (err) {
			return res.status(400).send("err in post /admin");
		} else {
			return res.status(200).json("success");//res
		}
	});
});

router.get("/", function(req, res, next){//无参数
	Admin.find({}, function(err, admins){
		if(err){
			return res.status(400).send("err in get /admin");
		}else{
			console.log(admins);
			return res.status(200).json(admins);//res:返回所有公告
		}
	})
});

//登录
router.post("/login", function(req, res, next){//req:帐号、密码
	var admin=req.body;
	Admin.findOne({ adminPhone: admin.adminPhone,adminPwd:admin.adminPwd}, function(err, admins){
		if(err){
			return res.status(400).send("err in get /admin");
		}else{
			if(admins==null){
				console.log("登录失败");
				return res.status(200).json("fail");
			}
			else{
				console.log("登录成功");
				return res.status(200).json("success");//res
			}
		}
	})
});

module.exports = router;