var express = require('express');
var router = express.Router();//定义router获取Router()方法库
var Admin = require('../models/admin');//定义User获取之前建立的User数据模型
var session = require('express-session');
var Safe = require('../models/safe');
var crypto = require('crypto');//加密解密

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
 * definition:
 *   Safe:
 *     properties:
 *       adminPhone:
 *         type: string
 *       adminState:
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
	//加密
		var md5 = crypto.createHash('md5');
		md5.update(admin.adminPwd);//管理员初始密码
		admin.adminPwd = md5.digest('hex');  //加密的密码
		console.log(admin.adminPwd);

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
		//加密
		var md5 = crypto.createHash('md5');
		md5.update(admin.adminPwd);//管理员初始密码
		admin.adminPwd = md5.digest('hex');  //加密的密码
		console.log(admin.adminPwd);
		
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
				req.session.admin=admin;
				//req.session.save();
				//console.log(req.sessionID);
				//console.log(req.session);
				//将信息更新至safe模型(若有记录，则更改状态，若无则新建记录)
				Safe.findOne({adminPhone:admin.adminPhone},function(e,r){
					if(r==null){
						var s={
							"adminPhone":admin.adminPhone,
							"adminState":"on"
						};
						Safe.create(s,function(e1,r1){
							if(e1){
								return res.status(400).send("err in post /admin/login");
							}else{
								return res.status(200).json("success");
							}
						})
					}else{
						Safe.update({adminPhone:admin.adminPhone},{adminState:"on"},function(e1,r1){
							if(e1){
								return res.status(400).send("err in post /admin/login");
							}else{
								return res.status(200).json("success");
							}
						})
					}
				})
			}
		}
	})
});

/**
 * @swagger
 * /admin/logout:
 *   post:
 *     tags:
 *       - Admin
 *     summary: 管理员退出登录
 *     description: 管理员退出登录
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: logout
 *         schema:
 *           $ref: '#/definitions/Admin'
 */
//退出登录
router.post("/logout", function(req, res, next) {//参数：adminPhone
	var admin=req.body;
	req.session.admin=null;
	Safe.update({adminPhone:admin.adminPhone},{adminState:"off"},function(e,r){
		if(e){
			return res.status(400).send("error");
		}else{
			return res.status(200).json("admin logout");
		}
	})
	//return res.status(200).json("admin logout");
});

/**
 * @swagger
 * /admin/update/pwd:
 *   post:
 *     tags:
 *       - Admin
 *     summary: 修改管理员密码
 *     description: 修改管理员密码
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: object(adminPhone，oldPwd,newPwd)
 *         description: object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Admin'
 *     responses:
 *       200:
 *         description: success
 *       400:
 *         description: err in post /admin/update/pwd
 */
//管理员修改密码
router.post("/update/pwd", function(req, res, next){//req:oldPwd,newPwd
	//if(req.session.user) {
	Safe.findOne({adminState:"on"},function(e,r){//是否绑定adminPhone
  if(r==null){
    return res.status(200).json("admin login first");
  }else{
		var admin = req.body;
		//加密
		var md5 = crypto.createHash('md5');
		md5.update(admin.newPwd);
		admin.newPwd = md5.digest('hex');  //加密的新密码
		console.log(admin.newPwd);

		Admin.update({}, {adminPwd: admin.newPwd}, function (err, admins) {
			if (err) {
				return res.status(400).send("err in post /admin/update/pwd");
			} else {
				console.log("更新成功");
				return res.status(200).json("success");//res
			}
		})
	}
})
	//}else{
		//return res.status(200).json("user login first");
	//}
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
	Admin.remove({}, function(err, departs){
		if(err){
			return res.status(400).send("err in delete /admin");
		}else{
			return res.status(200).json("success");
		}
	})
});

module.exports = router;