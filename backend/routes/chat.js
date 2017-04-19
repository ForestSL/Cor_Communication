var express = require('express');
var router = express.Router();//定义router获取Router()方法库
var Chat = require('../models/chat');//定义Chat获取之前建立的Chat数据模型

//聊天需要：post/get/delete方法

//获取请求中的body部分，由此新建chat，添加到数据库中，数据库存储数据成功则返回数据，否则便报错
router.post("/", function(req, res, next){
	var chat = req.body;
	Chat.create(chat, function(err, chat){
		if (err) {
			return res.status(400).send("err in post /chat");
		} else {
			return res.status(200).json(chat);
		}
	});
});

//遍历数据库，取出数据存入chats中并返回
router.get("/", function(req, res, next){
	Chat.find({}, function(err, chats){
		if(err){
			return res.status(400).send("err in get /chat");
		}else{
			console.log(chats);
			return res.status(200).json(chats);
		}
	})
});

//根据发送者ID接受者ID确定删除内容（用户自主执行）
router.delete("/", function(req, res, next){
	var chat=req.body;
	Chat.remove({sendId:chat.sendId,receiveId:chat.receiveId}, function(err, chats){
		if(err){
			return res.status(400).send("err in get /chat");
		}else{
			console.log("删除成功");
			return res.status(200).json(chats);
		}
	})
});

module.exports = router;