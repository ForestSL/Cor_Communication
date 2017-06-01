var express = require('express');
var router = express.Router();//定义router获取Router()方法库
var Test = require('../models/test');

/**
 * @swagger
 * definition:
 *   Test:
 *     properties:
 *       info:
 *         type: string
 */

/**
 * @swagger
 * /test:
 *   post:
 *     tags:
 *       - Test
 *     summary: 开发者存储测试接口
 *     description: 测试用
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: test
 *         description: Test object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Test'
 *     responses:
 *       200:
 *         description: success
 *       400:
 *         description: err in post /test
 */
router.post("/", function(req, res, next){//req
	var test = req.body;	
	Test.create(test, function(err, test){
		if (err) {
			return res.status(400).send("err in post /test");
		} else {
			return res.status(200).json("success");//res
		}
	}) 	
});

/**
 * @swagger
 * /test:
 *   get:
 *     tags:
 *       - Test
 *     summary: 返回测试接口信息
 *     description: 返回测试接口信息
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: 返回测试接口信息
 *         schema:
 *           $ref: '#/definitions/Test'
 *       400:
 *         description: err in get /Test
 */
router.get("/", function(req, res, next){//无参数
	Test.find({}, function(err, tests){
		if(err){
			return res.status(400).send("err in get /test");
		}else{
			console.log(tests);
			return res.status(200).json(tests);//res
		}
	})
});

/**
 * @swagger
 * /test:
 *   delete:
 *     tags:
 *       - Test
 *     summary: 开发人员进行数据测试删除所有数据
 *     description: 删除信息
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: success
 */
router.post("/delete", function(req, res, next){
	var test=req.body;
	Test.remove({ }, function(err, tests){
		if(err){
			return res.status(400).send("err in post /test/delete");
		}else{
			console.log("删除成功");
			return res.status(200).json("success");//res
		}
	})
});

module.exports = router;