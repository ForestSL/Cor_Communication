var express = require('express');
var router = express.Router();//定义router获取Router()方法库
var Task = require('../models/task');

/**
 * @swagger
 * definition:
 *   Task:
 *     properties:
 *       taskID:
 *         type: number
 *       authorID:
 *         type: number
 *       authorDepart:
 *         type: number
 *       taskBegin:
 *         type: string
 *       taskEnd:
 *         type: string
 *       content:
 *         type: string
 *       taskState:
 *         type: number
 */

/**
 * @swagger
 * /task:
 *   post:
 *     tags:
 *       - Task
 *     summary: 记录新的任务【暂未使用】
 *     description: 任务记录
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: task
 *         description: Task object
 *         in: body
 *         required: true
 *         schema:
 *           $ref: '#/definitions/Task'
 *     responses:
 *       200:
 *         description: success
 *       400:
 *         description: err in post /task
 */
router.post("/", function(req, res, next){//req
	var task = req.body;

			Task.create(task, function(err, task){
				if (err) {
					return res.status(400).send("err in post /task");
				} else {
					return res.status(200).json("success");//res
				}
			})
});

/**
 * @swagger
 * /task:
 *   get:
 *     tags:
 *       - Task
 *     summary: 返回所有任务信息【暂未使用】
 *     description: 返回所有任务
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: 所有任务
 *         schema:
 *           $ref: '#/definitions/Task'
 *       400:
 *         description: err in get /task
 */
//管理员后台查看所有任务记录
router.get("/", function(req, res, next){//无参数
	Task.find({}, function(err, tasks){
		if(err){
			return res.status(400).send("err in get /task");
		}else{
			console.log(tasks);
			return res.status(200).json(tasks);//res:返回所有公告
		}
	})
});

module.exports = router;