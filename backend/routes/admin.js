var express = require('express');
var router = express.Router();//定义router获取Router()方法库
var Admin = require('../models/admin');//定义User获取之前建立的User数据模型

/**
 * @swagger
 * definition:
 *   Admin:
 *     properties:
 *       adminPhone:
 *         type: string
 *       adminPwd:
 *         type: string
 */

/**
 * @swagger
 * /admin:
 *   post:
 *     tags:
 *       - Admin
 *     summary: 新建管理员(帐号 密码)
 *     description: 创建新的管理员
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: admin(adminPhone、adminPwd)
 *         description: Admin object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Admin'
 *     responses:
 *       200:
 *         description: success/exist
 *       400:
 *         description: err in post /admin
 */
router.post("/", function(req, res, next){//req
	var admin = req.body;
	Admin.findOne({ adminPhone: admin.adminPhone}, function(err, admins){//先看是否已经存在该部门
		if(admins==null){
			Admin.create(admin, function(err, admin){
				if (err) {
					return res.status(400).send("err in post /admin");
				} else {
					return res.status(200).json("success");//res
				}
			})
 		}
		else{
			return res.status(200).json("exist");//res:已经存在
		}		
 	})
});

/**
 * @swagger
 * /admin:
 *   get:
 *     tags:
 *       - Admin
 *     summary: 返回所有管理员信息
 *     description: 返回所有管理员
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: 所有管理员
 *         schema:
 *           $ref: '#/definitions/Admin'
 *       400:
 *         description: err in get /admin
 */
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

/**
 * @swagger
 * /admin/login:
 *   post:
 *     tags:
 *       - Admin
 *     summary: 根据帐号密码进行管理员登陆
 *     description: 登录
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: admin(adminPhone、adminPwd)
 *         description: Admin object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Admin'
 *     responses:
 *       400:
 *         description: err in post /admin/login
 */
//登录
router.post("/login", function(req, res, next){//req:帐号、密码
	var admin=req.body;
	Admin.findOne({ adminPhone: admin.adminPhone,adminPwd:admin.adminPwd}, function(err, admins){
		if(err){
			return res.status(400).send("err in post /admin/login");
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

/**
 * @swagger
 * /admin/delete:
 *   post:
 *     tags:
 *       - Admin
 *     summary: 根据帐号删除管理员
 *     description: 根据帐号删除管理员
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: admin(adminPhone)
 *         description: Admin object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Admin'
 *     responses:
 *       200:
 *         description: success
 *       400:
 *         description: err in post /admin/delete
 */
router.post("/delete", function(req, res, next){//req:adminPhone
	var admin=req.body;
	Admin.remove({ adminPhone: admin.adminPhone }, function(err, admins){
		if(err){
			return res.status(400).send("err in post /admin/delete");
		}else{
			console.log("删除成功");
			return res.status(200).json("success");//res
		}
	})
});

/**
 * @swagger
 * /admin:
 *   delete:
 *     tags:
 *       - Admin
 *     summary: 开发人员进行数据测试删除所有数据
 *     description: 删除信息
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: success
 */
//删除所有信息（开发者测试数据使用）
router.delete("/", function(req, res, next){
	Depart.remove({}, function(err, departs){
		if(err){
			return res.status(400).send("err in delete /admin");
		}else{
			return res.status(200).json("success");
		}
	})
});

module.exports = router;