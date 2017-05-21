var express = require('express');
var router = express.Router();//定义router获取Router()方法库
var Bulletin = require('../models/bulletin');//定义Bulletin获取之前建立的Bulletin数据模型

/**
 * @swagger
 * definition:
 *   Bulletin:
 *     properties:
 *       departName:
 *         type: string
 *       name:
 *         type: string
 *       content:
 *         type: string
 *       time:
 *         type: string
 */

/**
 * @swagger
 * /bulletin:
 *   post:
 *     tags:
 *       - Bulletin
 *     summary: 新建公告
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
router.post("/", function(req, res, next){//req:部门名称、公告名称、公告内容、时间
	var bulletin = req.body;
	Bulletin.create(bulletin, function(err, bulletin){
		if (err) {
			return res.status(400).send("err in post /bulletin");
		} else {
			return res.status(200).json("success");//res
		}
	});
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
			console.log(Bulletin.count());
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
//查找公告：用户
router.post("/search", function(req, res, next){//req:部门ID
	var bulletin = req.body;
	Bulletin.find({ departName: bulletin.departName}, function(err, bulletins){
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
 * /bulletin/delete:
 *   post:
 *     tags:
 *       - Bulletin
 *     summary: 根据公告时间删除公告
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
	var bulletin = req.body;
	Bulletin.remove({ time: bulletin.time }, function(err, bulletins){
		if(err){
			return res.status(400).send("err in post /bulletin");
		}else{
			console.log("删除成功");
			return res.status(200).json("success");//res
		}
	})
});

module.exports = router;