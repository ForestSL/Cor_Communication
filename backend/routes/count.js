var express = require('express');
var router = express.Router();//定义router获取Router()方法库
var Count = require('../models/count');

/**
 * @swagger
 * definition:
 *   Count:
 *     properties:
 *       departNum:
 *         type: number
 *       userNum:
 *         type: number
 */

/**
 * @swagger
 * /count:
 *   post:
 *     tags:
 *       - Count
 *     summary: 测试人员使用，后台自动生成ID
 *     description: 测试用
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: success
 *       400:
 *         description: err in post /count
 */
router.post("/", function(req, res, next){//req
	var count = req.body;	
	Count.create(count, function(err, count){
		if (err) {
			return res.status(400).send("err in post /count");
		} else {
			return res.status(200).json("success");//res
		}
	}) 	
});

/**
 * @swagger
 * /count:
 *   get:
 *     tags:
 *       - Count
 *     summary: 返回当前记录（测试人员用）
 *     description: 测试用
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: 所有记录
 *         schema:
 *           $ref: '#/definitions/Admin'
 *       400:
 *         description: err in get /count
 */
router.get("/", function(req, res, next){//无参数
	Count.find({}, function(err, counts){
		if(err){
			return res.status(400).send("err in get /count");
		}else{
			console.log(counts);
			return res.status(200).json(counts);
		}
	})
});

/**
 * @swagger
 * /admin:
 *   delete:
 *     tags:
 *       - Count
 *     summary: 删除记录（测试人员用）
 *     description: 测试用
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: success
 *       400:
 *         description: err in delete /count
 */
router.delete("/", function(req, res, next){
	Count.remove({ }, function(err, result){
		if(err){
			return res.status(400).send("err in delete /count");
		}else{
			console.log("删除成功");
			return res.status(200).json("success");//res
		}
	})
});

module.exports = router;