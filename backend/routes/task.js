var express = require('express');
var router = express.Router();//定义router获取Router()方法库
var request = require('request');
var Task = require('../models/task');

var baseUrl="http://kermit:kermit@115.159.38.100:8081/activiti-rest/service/";

//流程部署(参数：deployFile)
router.post('/deploy/upload', function(req, res){
    var deploy=req.body;
    var method = "POST";
    var proxy_url = baseUrl+"repository/deployments";

    var options = {
      headers: {"Connection": "close"},
        url: proxy_url,
        method: method,
        json: true,
        body: deploy.deployFile//流程文件 关于参数形式？？？
    };

    function callback(error, response, data) {
        if (!error && response.statusCode == 200) {
          console.log('部署ID：',data.id);
          console.log('部署详情：',data);
          res.json(data);
        }
        if (!error && response.statusCode == 404) {
          console.log(' there was no content present in the request body or the content mime-type is not supported for deployment');
          res.json('wrong');
        }
    }
    request(options, callback);
})

//删除流程部署(参数：deploymentId)
router.post('/deploy/delete', function(req, res){
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
        if (!error && response.statusCode == 404) {
          console.log('the requested deployment was not found!');
          res.json('notfound');
        }
    }
    request(options, callback);
})

//获取流程列表(无参数)
router.get('/process/all', function(req, res){
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

//激活/挂起流程(参数：流程号processDefinitionId、操作action:activate或suspend)
router.post('/process/action', function(req, res){
    var myprocess=req.body;
    var method = "PUT";
    var proxy_url = baseUrl+"repository/process-definitions/"+myprocess.processDefinitionId;

    var options = {
      headers: {"Connection": "close"},
        url: proxy_url,
        method: method,
        json: true,
        body: {"action":myprocess.action}
    };

    function callback(error, response, data) {
        if (!error && response.statusCode == 200) {
          console.log('suspend successfully!');
          console.log('流程状态：',data.action);
          console.log('是否包含流程实例：',data.includeProcessInstances);
          res.json(data);
        }
        if (!error && response.statusCode == 404) {
          console.log('the requested process definition was not found!');
          res.json('notfound');
        }
        if (!error && response.statusCode == 409) {
          console.log('the requested process definition is already suspended!');
          res.json('suspend');
        }
    }
    request(options, callback);
})

//获取流程实例列表(无参数)
router.get('/processinstance', function(req, res){
    var method = "GET";
    var proxy_url = baseUrl+"runtime/process-instances";
    var options = {
      headers: {"Connection": "close"},
        url: proxy_url,
        method: method,
        json: true
    };

    function callback(error, response, data) {
        if (!error && response.statusCode == 200) {
          console.log('流程实例总数：',data.total);
          console.log('流程实例列表：',data.data);
          res.json(data);
        }
        if (!error && response.statusCode == 400) {
          console.log('a parameter was passed in the wrong format!');
          res.json('wrongparameter');
        }
    }
    request(options, callback);
})

//获取一个流程实例(参数：流程实例号processInstanceId)
router.post('/processinstance', function(req, res){
    var myprocess=req.body;
    var method = "GET";
    var proxy_url = baseUrl+"runtime/process-instances/"+myprocess.processInstanceId;

    var options = {
      headers: {"Connection": "close"},
        url: proxy_url,
        method: method,
        json: true
    };

    function callback(error, response, data) {
        if (!error && response.statusCode == 200) {
          console.log('实例详情：',data);
          res.json(data);
        }
        if (!error && response.statusCode == 404) {
          console.log('the requested process instance was not found!');
          res.json('notfound');
        }
    }
    request(options, callback);
})

//删除一个流程实例(参数：流程实例号processInstanceId)
router.post('/processinstance/delete', function(req, res){
    var myprocess=req.body;
    var method = "DELETE";
    var proxy_url = baseUrl+"runtime/process-instances/"+myprocess.processInstanceId;

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
        if (!error && response.statusCode == 404) {
          console.log('the requested process instance was not found!');
          res.json('notfound');
        }
    }
    request(options, callback);
})

//启动一个流程实例(参数：流程号processDefinitionId)???
router.post('/processinstance/start', function(req, res){
    var myprocess=req.body;
    var method = "POST";
    var proxy_url = baseUrl+"runtime/process-instances";

    var options = {
      headers: {"Connection": "close"},
        url: proxy_url,
        method: method,
        json: true,
        body: {"processDefinitionId":myprocess.processDefinitionId}
    };

    function callback(error, response, data) {
        if (!error && response.statusCode == 200) {
          console.log('启动成功：',data);
          res.json(data);
        }
    }
    request(options, callback);
})

module.exports = router;
