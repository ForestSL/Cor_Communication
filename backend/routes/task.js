var express = require('express');
var router = express.Router();//定义router获取Router()方法库
var request = require('request');
var Task = require('../models/task');

var baseUrl="http://kermit:kermit@115.159.38.100:8081/activiti-rest/service/";

//流程部署(参数：deployFile)
router.post('/upload/deploy', function(req, res){
    var deploy=req.body;
    var method = "POST";
    var proxy_url = baseUrl+"repository/deployments";

    var options = {
      headers: {"Connection": "close"},
        url: proxy_url,
        method: method,
        json: true,
        body: deploy.deployFile//流程文件
    };

    function callback(error, response, data) {
        if (!error && response.statusCode == 200) {
          console.log('部署ID：',data.id);
          console.log('部署详情：',data);
          res.json(data);
        }
    }
    request(options, callback);
})

//删除流程部署(参数：deploymentId)
router.post('/delete/deploy', function(req, res){
    var deploy=req.body;
    var method = "DELETE";
    var proxy_url = baseUrl+"repository/deployments/"+deploy.deploymentId;

    var options = {
      headers: {"Connection": "close"},
        url: proxy_url,
        method: method,
        json: true
    };

    function callback(error, response, data) {
        if (!error && response.statusCode == 200) {
          console.log('delete successfully!');
            res.json('success');
        }
    }
    request(options, callback);
})

//获取流程列表(无参数)
router.get('/all', function(req, res){
    var method = "GET";
  	var proxy_url = baseUrl+"repository/process-definitions";
  	var options = {
  		headers: {"Connection": "close"},
        url: proxy_url,
        method: method,
        json: true
  	};

  	function callback(error, response, data) {
      	if (!error && response.statusCode == 200) {
        	console.log('流程总数：',data.total);
          console.log('流程列表：',data.data);
          res.json(data);
      	}
  	}
  	request(options, callback);
})

//挂起流程(参数：processDefinitionId)
router.post('/suspend/process', function(req, res){
    var myprocess=req.body;
    var method = "PUT";
    var proxy_url = baseUrl+"repository/process-definitions/"+deploy.processDefinitionId;

    var options = {
      headers: {"Connection": "close"},
        url: proxy_url,
        method: method,
        json: true
    };

    function callback(error, response, data) {
        if (!error && response.statusCode == 200) {
          console.log('suspend successfully!');
          console.log('流程状态：',data.action);
          console.log('流程下属实例：',data.includeProcessInstances);
          res.json(data);
        }
    }
    request(options, callback);
})

module.exports = router;
