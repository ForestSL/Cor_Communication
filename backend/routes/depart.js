var express = require('express');
var router = express.Router();//定义router获取Router()方法库
var Depart = require('../models/depart');//定义Depart获取之前建立的Depart数据模型
var User = require('../models/user');//定义User获取之前建立的User数据模型
var Count = require('../models/count');

/**
 * @swagger
 * definition:
 *   Depart:
 *     properties:
 *       departID:
 *         type: number
 *       departName:
 *         type: string
 *       parentID:
 *         type: number
 *       parentName:
 *         type: string
 *       leaderID:
 *         type: number
 *       leaderName:
 *         type: string
 */

 /**
 * @swagger
 * /depart:
 *   post:
 *     tags:
 *       - Depart
 *     summary: 管理员在后台增加部门(登录权限验证)
 *     description: 创建新的部门
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: depart(departName,parentName)
 *         description: Depart object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Depart'
 *     responses:
 *       200:
 *         description: 创建成功
 */
//新建部门：管理员
router.post("/", function(req, res, next){//req:部门名字(后台自动生成ID)、父部门名字(后台判断ID)
	//if(req.session.admin) {
		var depart = req.body;
		Depart.findOne({departName: depart.departName}, function (err, departs) {//先看是否已经存在该部门
			if (departs == null) {
				//查找部门ID当前数量
				Count.findOne({}, function (err, counts) {
					//Count.departNum = Count.departNum+1;//部门数加一
					depart.departID = counts.departNum + 1;//获得部门ID
					//console.log(Count.departNum);

					//更新部门Num
					Count.update({}, {departNum: counts.departNum + 1}, function (err, result) {
						console.log("部门ID加一");
					})
				})

				//根据父部门名字查找父部门ID
				Depart.findOne({departName: depart.parentName}, function (err, result) {
					if (result == null) {
						depart.parentID = 0;
					} else {
						depart.parentID = result.departID;//获得父部门ID
					}
					console.log(depart);

					Depart.create(depart, function (err, depart) {
						if (err) {
							return res.status(400).send("err in post /depart");
						} else {
							return res.status(200).json("success");//res
						}
					})
				})
			}
			else {
				return res.status(200).json("exist");//res:已经存在该部门

			}
		})
	//}else{
		//return res.status(200).json("admin login first");
	//}
});

/**
 * @swagger
 * /depart:
 *   get:
 *     tags:
 *       - Depart
 *     summary: 返回所有部门对象信息
 *     description: 返回所有部门
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: 所有部门
 *         schema:
 *           $ref: '#/definitions/Depart'
 */
//返回所有部门信息：用户
router.get("/", function(req, res, next){//无参数
		Depart.find({}, function (err, departs) {
			if (err) {
				return res.status(400).send("err in get /depart");
			} else {
				console.log(departs);
				return res.status(200).json(departs);//res
			}
		})
});

/**
 * @swagger
 * /depart/search:
 *   post:
 *     tags:
 *       - Depart
 *     summary: 管理员根据部门ID返回部门所有信息(登录权限验证)
 *     description: 查找具体部门信息
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: depart(departID)
 *         description: Depart object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Depart'
 *     responses:
 *       200:
 *         description: 部门对象信息
 */
//根据部门ID返回该部门所有信息：管理员用
router.post("/search", function(req, res, next){//req:departID
	//if(req.session.admin) {
	var depart=req.body;
	Depart.find({ departID:depart.departID }, function(err, departs){
		if(err){
			return res.status(400).send("err in post /depart/search");
		}else{
			console.log(departs);
			return res.status(200).json(departs);//res：部门信息
		}
	})
	//}else{
		//return res.status(200).json("admin login first");
	//}
});

/**
 * @swagger
 * /depart/delete:
 *   post:
 *     tags:
 *       - Depart
 *     summary: 管理员在后台根据部门名称删除部门(登录权限验证)
 *     description: 删除部门
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: depart(departName)
 *         description: Depart object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Depart'
 *     responses:
 *       200:
 *         description: success/exist user/exist children/no depart
 */
//删除部门：管理员
//删除部门的子部门以及部门内员工的处理
router.post("/delete", function(req, res, next){//req:待删除部门名称
	//if(req.session.admin) {
	var depart=req.body;
	Depart.findOne({ departName: depart.departName},function(err, result){	
		if(result==null){
			console.log("没有该部门");
			return res.status(200).json("no depart");
		}else{
			//获得部门ID
			depart.departID=result.departID;
			Depart.findOne({ parentID: depart.departID}, function(err, departs){//先看是否有其他部门的父部门是该删除的部门
				if(departs==null){
					User.findOne({ userDepart: depart.departID}, function(err, users){//先看删除部门内是否还有员工
						if(users==null){
		 					Depart.remove({ departID: depart.departID}, function(err, departs){
								if(err){
									return res.status(400).send("err in post /depart/delete");
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
		}
	})
	//}else{
		//return res.status(200).json("admin login first");
	//}
});

/**
 * @swagger
 * /depart/search/first:
 *   get:
 *     tags:
 *       - Depart
 *     summary: 返回给web端一级部门
 *     description: 查找一级部门
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: 子部门对象信息
 */
//组织树信息返回，根据部门名称返回该部门子部门
router.get("/search/first", function(req, res, next){
	Depart.find({ parentID: 0 }, function(err, departs){
		if(err){
			return res.status(400).send("err in post /depart/search/first");
		}else{
			console.log(departs);
			return res.status(200).json(departs);//res:所有一级部门
		}
	})
});

/**
 * @swagger
 * /depart/search/children:
 *   post:
 *     tags:
 *       - Depart
 *     summary: 管理员在后台根据部门名称返回该部门子部门
 *     description: 查找子部门
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: depart(departName)
 *         description: Depart object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Depart'
 *     responses:
 *       200:
 *         description: 子部门对象信息
 */
//组织树信息返回，根据部门名称返回该部门子部门
router.post("/search/children", function(req, res, next){//req:部门名(作为父部门)
		var depart = req.body;
		Depart.findOne({parentName: depart.departName}, function (err, departs) {
			if (err) {
				return res.status(400).send("err in post /depart/search/children");
			} else {
				if (departs == null) {
					console.log("空");
					return res.status(200).json("null");
				} else {
					Depart.find({parentName: depart.departName}, function (err, results) {
						console.log(results);
						return res.status(200).json(results);//res:该父部门下所有子部门
					})
				}
			}
		})
});

/**
 * @swagger
 * /depart/update/name:
 *   post:
 *     tags:
 *       - Depart
 *     summary: 根据ID以及新名字修改信息(登录权限验证)
 *     description: 根据ID修改名字
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: depart(departID departName)
 *         description: Depart object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Depart'
 *     responses:
 *       200:
 *         description: success
 */
//修改部门名字
router.post("/update/name", function(req, res, next){//req:部门ID、新名字
	//if(req.session.user) {
		var depart = req.body;
		Depart.update({departID: depart.departID}, {departName: depart.departName}, function (err, departs) {
			if (err) {
				return res.status(400).send("err in post /depart/update/name");
			} else {
				User.update({userDepart: depart.departID}, {DepartName: depart.departName}, function (err, users) {
					if (err) {
						return res.status(400).send("err in post /depart/update/name");
					} else {
						//return res.status(400).send("success");
						//修改员工对应部门名称
						User.update({userDepart: depart.departID}, {DepartName: depart.departName}, function (err, users) {
							if(err){
								return res.status(400).send("err in post /depart/update/name");
							}else {
								//return res.status(400).send("success");
								//修改父部门名称
								Depart.update({parentID: depart.departID}, {parentName: depart.departName}, function (err, des) {
									if(err){
										return res.status(400).send("err in post /depart/update/name");
									}else {
										return res.status(400).send("success");
									}
								})
							}
						})
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
 * /depart:
 *   delete:
 *     tags:
 *       - Depart
 *     summary: 开发人员进行数据测试删除所有数据
 *     description: 删除信息
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: success
 */
//删除所有部门信息（开发者测试数据使用）
router.delete("/", function(req, res, next){
	Depart.remove({}, function(err, departs){
		if(err){
			return res.status(400).send("err in delete /depart");
		}else{
			return res.status(200).json("success");
		}
	})
});

router.delete("/id", function(req, res, next){
	var p=req.body;
	Depart.remove({departID:p.departID}, function(err, departs){
		if(err){
			return res.status(400).send("err in delete /depart");
		}else{
			return res.status(200).json("success");
		}
	})
});

module.exports = router;