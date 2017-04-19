var express = require('express');
var router = express.Router();//定义router获取Router()方法库
var User = require('../models/user');//定义User获取之前建立的User数据模型

//新建用户：管理员
router.post("/", function(req, res, next){//req:ID、姓名、电话、密码、部门、聊天信息
	var user = req.body;
	User.create(user, function(err, user){
		if (err) {
			return res.status(400).send("err in post /user");
		} else {
			return res.status(200).json("success");
		}
	});
});

//遍历数据库，取出数据存入tasks中并返回
router.get("/", function(req, res, next){
	User.find({}, function(err, users){
		if(err){
			return res.status(400).send("err in get /user");
		}else{
			console.log(users);
			return res.status(200).json(users);
		}
	})
});

//删除指定ID用户
router.delete("/", function(req, res, next){
	var user=req.body;
	User.remove({ userId: user.userId}, function(err, users){
		if(err){
			return res.status(400).send("err in get /user");
		}else{
			console.log("删除成功");
			return res.status(200).json(users);
		}
	})
});

//根据ID更新用户密码部门
router.post("/update/pwd", function(req, res, next){
	var user=req.body;
	User.update({ userId: user.userId},{userPwd:user.userPwd}, function(err, users){
		if(err){
			return res.status(400).send("err in get /user");
		}else{
			console.log("更新成功");
			return res.status(200).json(users);
		}
	})
});

router.post("/update/depart", function(req, res, next){
	var user=req.body;
	User.update({ userId: user.userId},{userDepart:user.userDepart}, function(err, users){
		if(err){
			return res.status(400).send("err in get /user");
		}else{
			console.log("更新成功");
			return res.status(200).json(users);
		}
	})
});

//登录
router.post("/login", function(req, res, next){
	var user=req.body;
	User.findOne({ userId: user.userId,userPwd:user.userPwd}, function(err, users){
		if(err){
			return res.status(400).send("err in get /user");
		}else{
			if(users==null){
				console.log("登录失败");
				return res.status(200).json("登录失败");
			}
			else{
				console.log("登录成功");
				return res.status(200).json("登录成功");
			}
		}
	})
});


module.exports = router;