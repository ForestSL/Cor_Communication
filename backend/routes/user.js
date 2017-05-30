var express = require('express');
var router = express.Router();//定义router获取Router()方法库
var User = require('../models/user');//定义User获取之前建立的User数据模型
var Depart = require('../models/depart');//定义Depart获取之前建立的Depart数据模型
var Task = require('../models/task');
var Count = require('../models/count');

/**
 * @swagger
 * definition:
 *   User:
 *     properties:
 *       userID:
 *         type: number
 *       userName:
 *         type: string
 *       userPicture:
 *         type: string
 *       userPhone:
 *         type: string
 *       userPwd:
 *         type: string
 *       userDepart:
 *         type: number
 *       DepartName:
 *         type: string
 *       isLeader:
 *         type: number
 */

/**
 * @swagger
 * /user:
 *   post:
 *     tags:
 *       - User
 *     summary: 管理员后台添加新用户
 *     description: 创建新的用户
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: user(userName、userPhone、userPwd、DepartName、userPicture)
 *         description: User object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/User'
 *     responses:
 *       200:
 *         description: exist/no depart/success
 */
//新建用户：管理员
router.post("/", function(req, res, next){//req:姓名、电话、密码、头像
	var user = req.body;
    User.findOne({ userPhone: user.userPhone}, function(err, users){//根据帐号（电话）先看是否已经存在该用户
		if(users==null){
			//查找部门ID当前数量
			Count.findOne({}, function(err, counts){
				user.userID = counts.userNum+1;//获得userID
				console.log(user.userID);
				//更新用户Num
				Count.update({},{userNum:counts.userNum+1}, function(err, result){
					console.log("用户ID加一");
				})
			})

			User.create(user, function(err, user){
			    if (err) {
					return res.status(400).send("err in post /user");
				} else {
					//console.log(78);
					return res.status(200).json("success");//res
				}
			})
 		}else{
			return res.status(200).json("exist");//res:已经存在该用户
		}	
	})	
});

//删除所有信息（测试用）
router.delete("/", function(req, res, next){
	User.remove({ }, function(err, users){
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
//根据ID更新用户密码：用户
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
				return res.status(200).json(users);//res
			}
		}
	})
});

/**
 * @swagger
 * /user/task/author:
 *   post:
 *     tags:
 *       - Task
 *     summary: 当前用户提交的任务情况【暂时废弃不用】
 *     description: 根据提交者ID查看任务
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
 *         description: 返回该用户提交的任务
 *         schema:
 *           $ref: '#/definitions/Task'
 */
//用户查看所有自己提交的任务情况：根据userID=authorID(用户ID与发起任务发起者ID相同的人)查看公告
router.post("/task/author", function(req, res, next){//req:userID
	var user=req.body;
	Task.find({ authorID: user.userID }, function(err, tasks){
		if(err){
			return res.status(400).send("err in post /task");
		}else{
			console.log(tasks);
			return res.status(200).json(tasks);//res
		}
	})
});

module.exports = router;