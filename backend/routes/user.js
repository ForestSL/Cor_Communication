var express = require('express');
var router = express.Router();//定义router获取Router()方法库
var User = require('../models/user');//定义User获取之前建立的User数据模型
var Depart = require('../models/depart');//定义Depart获取之前建立的Depart数据模型

/**
 * @swagger
 * definition:
 *   User:
 *     properties:
 *       userID:
 *         type: number
 *       userName:
 *         type: string
 *       userPhone:
 *         type: string
 *       userPwd:
 *         type: string
 *       userDepart:
 *         type: number
 *       isLeader:
 *         type: number
 */

/**
 * @swagger
 * /user:
 *   post:
 *     tags:
 *       - User
 *     summary: 新建用户
 *     description: 创建新的用户
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: user
 *         description: User object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/User'
 *     responses:
 *       200:
 *         description: 创建成功
 */
//新建用户：管理员
router.post("/", function(req, res, next){//req:ID、姓名、电话、密码、部门、是否部长、聊天信息
	var user = req.body;
	User.findOne({ userPhone: user.userPhone}, function(err, users){//根据帐号（电话）先看是否已经存在该用户
		if(users==null){
			Depart.findOne({ departID: user.userDepart}, function(err, departs){//先看是否有该部门
				if(departs==null){
					return res.status(200).json("no depart");//res:没有该部门
				}else{
					User.create(user, function(err, user){
						if (err) {
							return res.status(400).send("err in post /user");
						} else {
							return res.status(200).json("success");//res
						}
					})
				}
			})
 		}
		else{
			return res.status(200).json("exist");//res:已经存在该用户
		}		
 	})
});

/**
 * @swagger
 * /user:
 *   get:
 *     tags:
 *       - User
 *     summary: 返回用户信息
 *     description: 返回所有用户
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: 所有用户
 *         schema:
 *           $ref: '#/definitions/User'
 */
//返回所有用户
router.get("/", function(req, res, next){//无参数
	User.find({}, function(err, users){
		if(err){
			return res.status(400).send("err in get /user");
		}else{
			console.log(users);
			return res.status(200).json(users);//res:ID、姓名、电话、密码、部门、是否部长、聊天信息
		}
	})
});

/**
 * @swagger
 * /user/search:
 *   post:
 *     tags:
 *       - User
 *     summary: 查找部门所有员工
 *     description: 根据部门ID查找用户
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: user(userDepart)
 *         description: User object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/User'
 *     responses:
 *       200:
 *         description: 返回该部用户
 *         schema:
 *           $ref: '#/definitions/User'
 */
//根据部门ID返回用户信息：管理员、用户
router.post("/search", function(req, res, next){//req:部门ID
	var user=req.body;
	User.find({ userDepart: user.userDepart }, function(err, users){
		if(err){
			return res.status(400).send("err in get /user");
		}else{
			console.log(users);
			return res.status(200).json(users);//res:ID、姓名、电话、密码、部门、是否部长、聊天信息
		}
	})
});

/**
 * @swagger
 * /user/delete:
 *   post:
 *     tags:
 *       - User
 *     summary: 根据用户ID删除用户
 *     description: 根据ID删除用户
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: user(userID)
 *         description: User object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/User'
 *     responses:
 *       200:
 *         description: success
 */
//删除指定ID用户：管理员
router.post("/delete", function(req, res, next){//req：用户ID
	var user=req.body;
	User.remove({ userID: user.userID}, function(err, users){
		if(err){
			return res.status(400).send("err in post /user");
		}else{
			console.log("删除成功");
			return res.status(200).json("success");//res
		}
	})
});

/**
 * @swagger
 * /user/update/pwd:
 *   post:
 *     tags:
 *       - User
 *     summary: 根据用户ID修改密码
 *     description: 根据ID修改密码
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: user(userID userPwd)
 *         description: User object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/User'
 *     responses:
 *       200:
 *         description: success
 */
//根据ID更新用户密码：管理员
router.post("/update/pwd", function(req, res, next){//req:用户ID、用户新密码
	var user=req.body;
	User.update({ userID: user.userID},{userPwd:user.userPwd}, function(err, users){
		if(err){
			return res.status(400).send("err in post /user");
		}else{
			console.log("更新成功");
			return res.status(200).json("success");//res
		}
	})
});

/**
 * @swagger
 * /user/update/depart:
 *   post:
 *     tags:
 *       - User
 *     summary: 根据用户ID修改部门
 *     description: 根据ID修改部门
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: user(userID userDepart)
 *         description: User object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/User'
 *     responses:
 *       200:
 *         description: success
 */
//根据ID更新用户部门：管理员
router.post("/update/depart", function(req, res, next){//req:用户ID、用户新部门
	var user=req.body;
	User.update({ userID: user.userID},{userDepart:user.userDepart}, function(err, users){
		if(err){
			return res.status(400).send("err in post /user");
		}else{
			console.log("更新成功");
			return res.status(200).json("success");//res
		}
	})
});

/**
 * @swagger
 * /user/update/isLeader:
 *   post:
 *     tags:
 *       - User
 *     summary: 根据用户ID修改职位
 *     description: 根据ID修改是否为部长
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: user(userID isLeader)
 *         description: User object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/User'
 *     responses:
 *       200:
 *         description: success
 */
//根据ID更新用户是否部长：管理员
router.post("/update/isleader", function(req, res, next){//req:用户ID、用户新职位（部长就用部门ID）
	var user=req.body;
	User.update({ userID: user.userID},{isLeader:user.isleader}, function(err, users){
		if(err){
			return res.status(400).send("err in post /user");
		}else{
			console.log("更新成功");
			return res.status(200).json("success");//res
		}
	})
});

/**
 * @swagger
 * /user/login:
 *   post:
 *     tags:
 *       - User
 *     summary: 根据用户帐号密码登录
 *     description: 登录
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: user(userPhone、userPwd)
 *         description: User object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/User'
 *     responses:
 *       400:
 *         description: err in post /user
 */
//登录
router.post("/login", function(req, res, next){//req:用户电话（帐号）、密码
	var user=req.body;
	User.findOne({ userPhone: user.userPhone,userPwd:user.userPwd}, function(err, users){
		if(err){
			return res.status(400).send("err in post /user");
		}else{
			if(users==null){
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