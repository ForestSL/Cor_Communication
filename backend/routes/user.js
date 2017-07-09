var express = require('express');
var router = express.Router();//定义router获取Router()方法库
var User = require('../models/user');//定义User获取之前建立的User数据模型
var Depart = require('../models/depart');//定义Depart获取之前建立的Depart数据模型
var Count = require('../models/count');
var request = require('request');

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
 *     summary: 管理员后台添加新用户(登录权限验证)
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
router.post("/", function(req, res, next){//req:姓名、电话
	//if(req.session.admin) {
		var user = req.body;
		User.findOne({userPhone: user.userPhone}, function (err, users) {//根据帐号（电话）先看是否已经存在该用户
			if (users == null) {
				//查找部门ID当前数量
				Count.findOne({}, function (err, counts) {
					user.userID = counts.userNum + 1;//获得userID
					console.log(user.userID);
					//更新用户Num
					Count.update({}, {userNum: counts.userNum + 1}, function (err, result) {
						console.log("用户ID加一");
					})

					User.create(user, function (err, user) {
						if (err) {
							return res.status(400).send("err in post /user");
						} else {
							//console.log(78);
							//return res.status(200).json("success");//res
							
							//--极光推送注册
          					var method = "POST";
          					var proxy_url = "https://api.im.jpush.cn/v1/users";

          					var b=new Buffer("c8882086c0e7d6a471b38245:27f02932ef2a6dee9d325213");
							var base64_auth_string=b.toString('base64');
          					var options = {
            					headers: {"Authorization": "Basic "+base64_auth_string},
            					url: proxy_url,
            					method: method,
            					json: true,
            					body: [{
          						"username":user.userPhone,
          						"password":user.userPwd,
          						"nickname":user.userName
          						}]
          					};

          					function callback(error, response, data) {
            					console.log(data);    
            					return res.status(200).json("success");//res       					
            				}
          					request(options, callback);
          					//--极光推送注册

						}
					})
				})
			} else {
				return res.status(200).json("exist");//res:已经存在该用户
			}
		})
	//}else{
		//return res.status(200).json("admin login first");
	//}
});

//用户禁用/启用状态
router.post("/state",function(req,res,next){
	var user=req.body;
	User.update({userID:user.userID},{state:user.state},function(err,users){
		if(err){
			return res.status(400).send("err in post /user/state");
		}else{
			return res.status(200).json("success");//res
		}
	})
});

/**
 * @swagger
 * /user:
 *   delete:
 *     tags:
 *       - User
 *     summary: 开发人员进行数据测试删除所有数据
 *     description: 删除信息
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: success
 */
//删除所有信息（测试用）
router.delete("/", function(req, res, next){
	User.remove({ }, function(err, users){
		if(err){
			return res.status(400).send("err in delete /user");
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
 *     summary: 返回所有用户信息(登录权限验证)
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
	//if(req.session.admin) {
		User.find({}, function (err, users) {
			if (err) {
				return res.status(400).send("err in get /user");
			} else {
				console.log(users);
				return res.status(200).json(users);//res
			}
		})
	//}else{
		//return res.status(200).json("admin login first");
	//}
});

/**
 * @swagger
 * /user/search/departid:
 *   post:
 *     tags:
 *       - User
 *     summary: 查找部门所有员工(登录权限验证)
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
router.post("/search/departid", function(req, res, next){//req:部门ID
	//if(req.session.user) {
	var user=req.body;
	User.find({ userDepart: user.userDepart }, function(err, users){
		if(err){
			return res.status(400).send("err in get /user/search/departid");
		}else{
			console.log(users);
			return res.status(200).json(users);//res:ID、姓名、电话、密码、部门、是否部长、聊天信息
		}
	})
	//}else{
		//return res.status(200).json("user login first");
	//}
});

/**
 * @swagger
 * /user/search/userid:
 *   post:
 *     tags:
 *       - User
 *     summary: 根据用户ID返回用户所有信息(登录权限验证)
 *     description: 用户ID查找用户信息
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
 *         description: 返回该用户信息
 *         schema:
 *           $ref: '#/definitions/User'
 */
//根据用户ID返回用户信息
router.post("/search/userid", function(req, res, next){//req:用户ID
	//if(req.session.user) {
		var user = req.body;
		User.find({userID: user.userID}, function (err, users) {
			if (err) {
				return res.status(400).send("err in get /user/search/userid");
			} else {
				console.log(users);
				return res.status(200).json(users);//res:该用户信息
			}
		})
	//}else{
		//return res.status(200).json("user login first");
	//}
});

/**
 * @swagger
 * /user/delete:
 *   post:
 *     tags:
 *       - User
 *     summary: 根据用户ID删除用户(登录权限验证)
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
//删除指定ID用户(彻底删除)
router.post("/delete", function(req, res, next){//req：用户ID
	//if(req.session.admin) {
		var user = req.body;
		User.remove({userID: user.userID}, function (err, users) {
			if (err) {
				return res.status(400).send("err in post /user/delete");
			} else {
				console.log("删除成功");
				//return res.status(200).json("success");
				//若该用户是部长，去除部长职位
				Depart.update({leaderID:user.userID},{leaderID:0,leaderName:"null"},function(err,departs){
					if(err){
						return res.status(400).send("err in post /user/delete");
					}else{
						return res.status(200).send("success");
					}
				})
			}
		})
	//}else{
		//return res.status(200).json("admin login first");
	//}
});

/**
 * @swagger
 * /user/update/pwd:
 *   post:
 *     tags:
 *       - User
 *     summary: 根据用户ID以及新密码修改密码(登录权限验证)
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
router.post("/update/pwd", function(req, res, next){//req:userID,userPhone,oldPwd,newPwd
	//if(req.session.user) {
		var user = req.body;
		User.update({userID: user.userID}, {userPwd: user.newPwd}, function (err, users) {
			if (err) {
				return res.status(400).send("err in post /user/update/pwd");
			} else {
				console.log("更新成功");
				//return res.status(200).json("success");//res
				//--极光推送注册
          					var method = "PUT";
          					var proxy_url = "https://api.im.jpush.cn/v1/users/"+user.userPhone+"/password";

          					var b=new Buffer("c8882086c0e7d6a471b38245:27f02932ef2a6dee9d325213");
							var base64_auth_string=b.toString('base64');
          					var options = {
            					headers: {"Authorization": "Basic "+base64_auth_string},
            					url: proxy_url,
            					method: method,
            					json: true,
            					body: {
          						"new_password":user.newPwd
          						}
          					};

          					function callback(error, response, data) {
            					console.log(data);    
            					return res.status(200).json("success");//res       					
            				}
          					request(options, callback);
          					//--极光推送注册
			}
		})
	//}else{
		//return res.status(200).json("user login first");
	//}
});

/**
 * @swagger
 * /user/update/name:
 *   post:
 *     tags:
 *       - User
 *     summary: 根据用户ID以及新名字修改信息(登录权限验证)
 *     description: 根据ID修改名字
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: user(userID userName)
 *         description: User object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/User'
 *     responses:
 *       200:
 *         description: success
 */
//修改员工名字
router.post("/update", function(req, res, next){//req:用户ID、用户新名字
	//if(req.session.user) {
		var user = req.body;
		User.update({userID: user.userID}, {userName: user.userName}, function (err, users) {
			if (err) {
				return res.status(400).send("err in post /user/update");
			} else {
				User.update({userID: user.userID}, {userPhone: user.userPhone}, function (err, users) {
					if (err) {
						return res.status(400).send("err in post /user/update");
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
 * /user/update/depart:
 *   post:
 *     tags:
 *       - User
 *     summary: 根据用户ID修改部门【暂未使用】
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
 * /user/update/leader:
 *   post:
 *     tags:
 *       - User
 *     summary: 根据部门名称、用户ID确认部长(登录权限验证)
 *     description: 修改部长
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: user(departName、userID)
 *         description: User object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/User'
 *     responses:
 *       200:
 *         description: success
 */
//根据部门名称、用户ID确认部长（先删除旧部长）
router.post("/update/leader", function(req, res, next){//req:departName、userID
	//if(req.session.admin) {
	var user = req.body;
	Depart.findOne({departName: user.departName}, function (err, result1) {//根据部门名找到部门ID：result1.departID
		if (result1 == null) {
			console.log("不存在该部门");
			return res.status(200).json("no depart");
		} else {
			User.findOne({userID: user.userID}, function (err, result2) {//根据用户ID找到用户名result2.userName
				if (result2 == null){
					return res.status(200).json("no user");
				}else{
					User.update({DepartName: user.departName}, {isLeader: 0}, function (err, result3) {//把该部门下所有员工设为普通员工
						if (err) {
							return res.status(400).send("err in post /user/update/leader");
						} else {
							User.update({userID: user.userID}, {
									userDepart: result1.departID,
									DepartName: user.departName,
									isLeader: result1.departID
								},
								function (err, result4) {//把该用户设为部长
									if (err) {
										return res.status(400).send("err in post /user/update/leader");
									} else {
										Depart.update({leaderID: user.userID}, {leaderID: 0, leaderName: "null"},
											function (err, result5) {//修改该用户原来部门的部长信息
												if (err) {
													return res.status(400).send("err in post /user/update/leader");
												} else {
													Depart.update({departName: user.departName}, {
															leaderID: user.userID,
															leaderName: result2.userName
														},
														function (err, result6) {//修改部门的部长信息
															if (err) {
																return res.status(400).send("err in post /user/update/leader");
															} else {
																console.log("success");
																return res.status(200).json("success");
															}
														})
												}
											})
									}
								})
						}
					})
				}
			})
		}
	})
	//}else{
		//return res.status(200).json("admin login first");
	//}
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
				//console.log("登录成功");
				req.session.user=user;
				//return res.status(200).json(users);//res
				//判断用户状态on、off
				if(users.state=="off")
					return res.status(200).json("forbidden");//res
				else
					return res.status(200).json(users);//res
			}
		}
	})
});

/**
 * @swagger
 * /user:
 *   get:
 *     tags:
 *       - User
 *     summary: 用户退出登录
 *     description: 用户退出登录
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: logout
 *         schema:
 *           $ref: '#/definitions/User'
 */
//退出登录
router.get("/logout", function(req, res, next) {
	req.session.user=null;
	return res.status(200).json("user logout");
});

/**
 * @swagger
 * /user/add/staff:
 *   post:
 *     tags:
 *       - User
 *     summary: 管理员将员工添加到相应部门(登录权限验证)
 *     description: 添加员工到部门
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: user(departName、userPhone)
 *         description: User object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/User'
 *     responses:
 *       400:
 *         description: err in post /user/add/staff
 */
//管理员将员工添加到相应部门
router.post("/add/staff", function(req, res, next){//req:departName、userPhone
	//if(req.session.admin) {
		var user = req.body;
		Depart.findOne({departName: user.departName}, function (err, result1) {//根据部门名找到部门ID：result1.departID
			if (err) {
				return res.status(400).send("err in post /user/add/staff");
			} else {
				User.update({userPhone: user.userPhone}, {userDepart: result1.departID, DepartName: user.departName},
					function (err, result2) {//修改用户的部门信息
						if (err) {
							return res.status(400).send("err in post /user/add/staff");
						} else {
							console.log("添加成功");
							return res.status(200).json("success");//res
						}
					})
			}
		})
	//}else{
		//return res.status(200).json("admin login first");
	//}
});

/**
 * @swagger
 * /user/remove/staff:
 *   post:
 *     tags:
 *       - User
 *     summary: 管理员将员工从相应部门删除(登录权限验证)
 *     description: 删除员工
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
 *       400:
 *         description: err in post /user/add/staff
 */
//管理员将员工从相应部门删除（还保留在公司人才库）
router.post("/remove/staff", function(req, res, next){//req:userID
	//if(req.session.admin) {
		var user = req.body;
		User.update({userID: user.userID}, {userDepart: 0, DepartName: "null"}, function (err, result2) {//修改用户的部门信息
			if (err) {
				return res.status(400).send("err in post /user/add/staff");
			} else {
				console.log("删除成功");
				return res.status(200).json("success");//res
			}
		})
	//}else{
		//return res.status(200).json("admin login first");
	//}
});

/**
 * @swagger
 * /user/task/author:
 *   post:
 *     tags:
 *       - Task
 *     summary: 当前用户提交的任务情况【暂未使用】
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