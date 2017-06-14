var express = require('express');
var router = express.Router();//定义router获取Router()方法库
var request = require('request');
var Task = require('../models/task');

var baseUrl="http://kermit:kermit@115.159.38.100:8081/activiti-rest/service/";

//不带参数
router.all('/1', function(req, res){
	var method = req.method.toUpperCase();
  	var proxy_url = baseUrl+"repository/deployments";

  	var options = {
  		headers: {"Connection": "close"},
        url: proxy_url,
        method: method,
        json: true,
        body: req.body
  	};

  	function callback(error, response, data) {
      	if (!error && response.statusCode == 200) {
        	console.log('------接口数据------',data);
          	res.json(data);
      	}
  	}
  	request(options, callback);
})

//待参数做URL
router.post('/2', function(req, res){
	var task=req.body;
	var method = "GET";
  	var proxy_url = baseUrl+"repository/deployments/"+task.id;

  	var options = {
  		headers: {"Connection": "close"},
        url: proxy_url,
        method: method,
        json: true,
        body: req.body
  	};

  	function callback(error, response, data) {
      	if (!error && response.statusCode == 200) {
        	console.log('------接口数据------',data);
          	res.json(data);
      	}
  	}
  	request(options, callback);
})

//待参数做URL和activiti参数
router.post('/3', function(req, res){
	var task=req.body;
	var method = "POST";
  	var proxy_url = baseUrl+"repository/process-definitions/"+task.id+"/identitylinks";

  	var options = {
  		headers: {"Connection": "close"},
        url: proxy_url,
        method: method,
        json: true,
        body: {"user" : "kermit"}//无法传参
  	};

  	function callback(error, response, data) {
      	if (!error && response.statusCode == 200) {
        	console.log('------接口数据------',data);
          	res.json(data);
      	}
  	}
  	request(options, callback);

})

module.exports = router;