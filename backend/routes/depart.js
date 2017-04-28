var express = require('express');
var router = express.Router();//定义router获取Router()方法库
var Depart = require('../models/depart');//定义Depart获取之前建立的Depart数据模型
var User = require('../models/user');//定义User获取之前建立的User数据模型

//新建部门：管理员
router.post("/", function(req, res, next){//req:部门ID、名字、父部门ID
	var depart = req.body;
	Depart.findOne({ departName: depart.departName}, function(err, departs){//先看是否已经存在该部门
		if(departs==null){
			Depart.create(depart, function(err, depart){
				if (err) {
					return res.status(400).send("err in post /depart");
				} else {
					return res.status(200).json("success");//res
				}
			})
 		}
		else{
			return res.status(200).json("exist");//res:已经存在该部门
		}		
 	})
});

//返回所有部门信息：管理员、用户
router.get("/", function(req, res, next){//无参数
	Depart.find({}, function(err, departs){
		if(err){
			return res.status(400).send("err in get /depart");
		}else{
			console.log(departs);
			return res.status(200).json(departs);//res:部门ID、名字、父部门ID
		}
	})
});

//删除部门：管理员
//删除部门的子部门以及部门内员工的处理
router.delete("/", function(req, res, next){//req:待删除部门ID
	var depart=req.body;
	Depart.findOne({ parent: depart.departID}, function(err, departs){//先看是否有其他部门的父部门是该删除的部门
		if(departs==null){
			User.findOne({ userDepart: depart.departID}, function(err, users){//先看删除部门内是否还有员工
				if(users==null){
		 			Depart.remove({ departID: depart.departID}, function(err, departs){
						if(err){
							return res.status(400).send("err in get /depart");
						}else{
							console.log("删除成功");
							return res.status(200).json("success");//res
						}
					})
		 		}
		 		else{
		 			return res.status(200).json("exist user");//res:存在员工，先处理员工
		 		}
 			})
 		}else{
 			return res.status(200).json("exist children");//res:存在子部门，先处理子部门
 		}
	})
});

module.exports = router;