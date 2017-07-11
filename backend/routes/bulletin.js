var express = require('express');
var router = express.Router();//定义router获取Router()方法库
var Bulletin = require('../models/bulletin');//定义Bulletin获取之前建立的Bulletin数据模型
var Depart = require('../models/depart');
var session = require('express-session');

/**
 * @swagger
 * definition:
 *   Bulletin:
 *     properties:
 *       departID:
 *         type: number
 *       departName:
 *         type: string
 *       name:
 *         type: string
 *       content:
 *         type: string
 *       time:
 *         type: string
 *       html:
 *         type: string
 *       delta:
 *         type: string
 *       state:
 *         type: string
 */

/**
 * @swagger
 * /bulletin:
 *   post:
 *     tags:
 *       - Bulletin
 *     summary: web端新建公告(登录权限验证)
 *     description: 创建新的公告
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: bulletin
 *         description: Bulletin object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Bulletin'
 *     responses:
 *       200:
 *         description: 创建成功
 */
//新建公告：管理员
router.post("/", function(req, res, next){//req:departName,name,content,time,html,delta
	//console.log(req.sessionID);
	//console.log(req.session);
	//if(req.session.admin) {
		var bulletin = req.body;
		//var promise = new mongoose.Promise();
		Depart.findOne({departName: bulletin.departName}, function (err, result) {
			//var promise = new mongoose.Promise();
			//promise.resolve(err, result);
			console.log(result);
			//var tmp=result.detail.departID;
			//result = result.toObject();
			console.log(result.departID);
			bulletin.departID = result.departID;
			//console.log(id);
			//bulletin.departID=id;
			Bulletin.create(bulletin, function (err, bulletin) {
				if (err) {
					return res.status(400).send("err in post /bulletin");
				} else {
					return res.status(200).json("success");//res
				}
			})
		})
	//}else{
		//return res.status(200).json("admin login first");
	//}
});

/**
 * @swagger
 * /bulletin:
 *   get:
 *     tags:
 *       - Bulletin
 *     summary: 返回公告
 *     description: 返回所有公告
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: 所有公告
 *         schema:
 *           $ref: '#/definitions/Bulletin'
 */
//返回所有公告：管理员
router.get("/", function(req, res, next){//无参数
	Bulletin.find({}, function(err, bulletins){
		if(err){
			return res.status(400).send("err in get /bulletin");
		}else{
			//console.log(Bulletin.count());
			return res.status(200).json(bulletins);//res:返回所有公告
		}
	})
});

/**
 * @swagger
 * /bulletin/search:
 *   post:
 *     tags:
 *       - Bulletin
 *     summary: 根据部门查找公告
 *     description: 根据公告发布部门名查找公告
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: bulletin(departName)
 *         description: Bulletin object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Bulletin'
 *     responses:
 *       200:
 *         description: 返回该部门现有公告
 *         schema:
 *           $ref: '#/definitions/Bulletin'
 */
//返回该用户所有公告列表：用户（当前app使用接口）
router.post("/search", function(req, res, next){//req:DepartName
	var user = req.body;
	Bulletin.find({ departName: user.DepartName}, function(err, bulletins){
		if(err){
			return res.status(400).send("err in post /bulletin");
		}else{
			console.log(bulletins);
			return res.status(200).json(bulletins);//res:返回该部门现有公告
		}
	})
});

/**
 * @swagger
 * /bulletin/search/unread/list:
 *   post:
 *     tags:
 *       - Bulletin
 *     summary: 用户查看未读的公告列表
 *     description: 用户查看未读的公告列表
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: bulletin(departName)
 *         description: Bulletin object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Bulletin'
 *     responses:
 *       200:
 *         description: 未读的公告列表
 *         schema:
 *           $ref: '#/definitions/Bulletin'
 */
//用户查看未读的公告列表
router.post("/search/unread/list",function(req,res,next){//参数：departName
	var user = req.body;
	Bulletin.find( {departName: user.departName}, function(err, bulletins){
		if(err){
			return res.status(400).send("err in post /bulletin");
		}else{
			console.log(bulletins);
			//return res.status(200).json(bulletins);
			Bulletin.find( {state: "unread"}, function(err, bts){
				if(err){
					return res.status(400).send("err in post /bulletin");
				}else{
					console.log(bulletins);
					return res.status(200).json(bulletins);//res:返回该部门现有未读公告
				}
			})
		}
	})
});

/**
 * @swagger
 * /bulletin/search/unread/detail:
 *   post:
 *     tags:
 *       - Bulletin
 *     summary: 用户查看未读的公告详情
 *     description: 用户查看未读的公告详情
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: bulletin(time)
 *         description: Bulletin object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Bulletin'
 *     responses:
 *       200:
 *         description: 未读的公告详情
 *         schema:
 *           $ref: '#/definitions/Bulletin'
 */
//用户查看未读的公告详情
router.post("/search/unread/detail",function(req,res,next){//参数：time
	var user = req.body;
	Bulletin.find( {time: user.time}, function(err, bulletins){
		if(err){
			return res.status(400).send("err in post /bulletin");
		}else{
			console.log(bulletins);
			return res.status(200).json(bulletins);
		}
	})	
});

/**
 * @swagger
 * /bulletin/search/read:
 *   post:
 *     tags:
 *       - Bulletin
 *     summary: 用户查看已读的公告
 *     description: 用户查看已读的公告
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: bulletin(departName)
 *         description: Bulletin object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Bulletin'
 *     responses:
 *       200:
 *         description: 已读的公告
 *         schema:
 *           $ref: '#/definitions/Bulletin'
 */
//用户查看已读的公告
router.post("/search/read",function(req,res,next){//参数：departName
	var user = req.body;
	Bulletin.find( {departName: user.departName}, function(err, bulletins){
		if(err){
			return res.status(400).send("err in post /bulletin");
		}else{
			console.log(bulletins);
			//return res.status(200).json(bulletins);//res:返回该部门现有已读公告
			Bulletin.find( {state: "read"}, function(err, bts){
				if(err){
					return res.status(400).send("err in post /bulletin");
				}else{
					console.log(bulletins);
					return res.status(200).json(bulletins);//res:返回该部门现有已读公告
				}
			})
		}
	})
});

/**
 * @swagger
 * /bulletin/delete:
 *   post:
 *     tags:
 *       - Bulletin
 *     summary: 根据公告时间删除公告(登录权限验证)
 *     description: 根据时间删除公告
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: bulletin(time)
 *         description: Bulletin object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Bulletin'
 *     responses:
 *       200:
 *         description: success
 */
//删除公告：管理员
router.post("/delete", function(req, res, next){//req:公告时间
	//if(req.session.admin) {
	var bulletin = req.body;
	console.log(bulletin.time);
	Bulletin.remove({ time: bulletin.time }, function(err, bulletins){

		if(err){
			console.log(err);
			return res.status(400).send("err in post /bulletin");
		}else{
			//console.log(err);
			//console.log(bulletins);
			return res.status(200).json("success");//res
		}
	})
	//}else{
		//return res.status(200).json("admin login first");
	//}
});

/**
 * @swagger
 * /bulletin/update:
 *   post:
 *     tags:
 *       - Bulletin
 *     summary: web端修改公告(登录权限验证)
 *     description: 修改公告
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: bulletin(lasttime departName name content time)
 *         description: Bulletin object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Bulletin'
 *     responses:
 *       200:
 *         description: 修改成功
 */
//修改公告
router.post("/update", function(req, res, next){//req:上次的时间lasttime、新公告
	//if(req.session.admin) {
	var bulletin = req.body;
		//删除旧公告
	Bulletin.remove({ time: bulletin.lasttime }, function(err, bulletins){
		if(err){
			console.log(err);
			return res.status(400).send("err in post /bulletin");
		}else{
			//var promise = new mongoose.Promise();
			Depart.findOne({departName: bulletin.departName}, function (err, result) {
			//var promise = new mongoose.Promise();
			//promise.resolve(err, result);
			console.log(result);
			//var tmp=result.detail.departID;
			//result = result.toObject();
			console.log(result.departID);
			bulletin.departID = result.departID;
			//console.log(id);
			//bulletin.departID=id;
			Bulletin.create(bulletin, function (err, bulletin) {
				if (err) {
					return res.status(400).send("err in post /bulletin");
				} else {
					return res.status(200).json("success");//res
				}
			})
			})
		}
	})
		
	//}else{
		//return res.status(200).json("admin login first");
	//}
});

/**
 * @swagger
 * /bulletin:
 *   delete:
 *     tags:
 *       - Bulletin
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
	Bulletin.remove({}, function(err, departs){
		if(err){
			return res.status(400).send("err in delete /bulletin");
		}else{
			return res.status(200).json("success");
		}
	})
});

module.exports = router;