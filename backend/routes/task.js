var express = require('express');
var router = express.Router();//定义router获取Router()方法库
var request = require('request');
var Deploy = require('../models/deploy');
var Process = require('../models/process');
var Task = require('../models/task');

var baseUrl="http://kermit:kermit@115.159.38.100:8081/activiti-rest/service/";

//---------------------------------部署--------------------------------------

//获取部署列表(无参数)
router.get('/deploy/all', function(req, res){
    var method = "GET";
    var proxy_url = baseUrl+"repository/deployments";

    var options = {
      headers: {"Connection": "close"},
        url: proxy_url,
        method: method,
        json: true
    };

    function callback(error, response, data) {
        if (!error && response.statusCode == 200) {
          console.log('部署总数：',data.total);
          //console.log('部署列表：',data.data[0].id);
          console.log('部署列表：',data.data);
          res.json(data);
        }
    }
    request(options, callback);
})

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
        if (!error && response.statusCode == 201) {
          console.log('部署ID：',data.id);
          console.log('部署详情：',data);
          res.json(data);
        }
        if (!error && response.statusCode == 400) {
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
        if (!error && response.statusCode == 204) {
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

//---------------------------------流程--------------------------------------

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
          res.json(data.data);
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
          console.log('successful');
          console.log('流程状态：',data.action);
          res.json(data);
        }
        if (!error && response.statusCode == 404) {
          console.log('the requested process definition was not found!');
          res.json('notfound');
        }
        if (!error && response.statusCode == 409) {
          console.log('the requested process definition is already suspended!');
          res.json('exist');
        }
    }
    request(options, callback);
})

//---------------------------------实例--------------------------------------

//获取流程实例列表(无参数)
router.get('/processinstance/all', function(req, res){
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
          res.json(data.data);
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
        if (!error && response.statusCode == 204) {
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

//激活、挂起流程实例(参数：流程实例号processInstanceId、操作action:activate或suspend)
router.post('/processinstance/action', function(req, res){
    var myprocess=req.body;
    var method = "PUT";
    var proxy_url = baseUrl+"runtime/process-instances/"+myprocess.processInstanceId;

    var options = {
      headers: {"Connection": "close"},
        url: proxy_url,
        method: method,
        json: true,
        body: {"action":myprocess.action}
    };

    function callback(error, response, data) {
        if (!error && response.statusCode == 200) {
          console.log('successful');
          console.log('流程实例状态：',data.action);
          res.json(data);
        }
        if (!error && response.statusCode == 404) {
          console.log('the requested process definition was not found!');
          res.json('notfound');
        }
        if (!error && response.statusCode == 409) {
          console.log('the requested process definition is already suspended!');
          res.json('exist');
        }
    }
    request(options, callback);
})

//启动一个流程实例(参数：流程号processDefinitionId):一个流程定义可以启动多个实例
router.post('/processinstance/start', function(req, res){
    var myprocess=req.body;
    var params = {
            "processDefinitionId": myprocess.processDefinitionId,
            "businessKey": myprocess.businessKey,
            "variables": myprocess.variables
        };
    var method = "POST";
    var proxy_url = baseUrl+"runtime/process-instances";

    var options = {
      headers: {"Connection": "close"},
        url: proxy_url,
        method: method,
        json: true,
        body: params
    };

    function callback(error, response, data) {
        if (!error && response.statusCode == 201) {
          console.log('启动成功：',data);
          res.json('success');
        }
        if (!error && response.statusCode == 400) {
          console.log('启动失败：',data);
          res.json('fail');
        }
    }
    request(options, callback);
})

//获得流程实例的流程图(参数：流程实例号processInstanceId)???
router.post('/processinstance/flow', function(req, res){
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
          console.log('实例流程图：',data);
          res.json(data);
        }
        if (!error && response.statusCode == 400) {
          console.log(data);
          res.json('notfound');
        }
    }
    request(options, callback);
})

//获得流程实例的参与者(参数：流程实例号processInstanceId)
router.post('/processinstance/user', function(req, res){
    var myprocess=req.body;
    var method = "GET";
    var proxy_url = baseUrl+"runtime/process-instances/"+myprocess.processInstanceId+"/identitylinks";

    var options = {
      headers: {"Connection": "close"},
        url: proxy_url,
        method: method,
        json: true
    };

    function callback(error, response, data) {
        if (!error && response.statusCode == 200) {
          console.log('实例参与者：',data);
          res.json(data);
        }
        if (!error && response.statusCode == 404) {
          console.log(data);
          res.json('notfound');
        }
    }
    request(options, callback);
})

//为流程实例添加参与者(参数：流程实例号processInstanceId、用户号user)
router.post('/processinstance/user/add', function(req, res){
    var myprocess=req.body;
    var method = "POST";
    var params = {
        "user": myprocess.user,
        "type": "participant"
    };
    var proxy_url = baseUrl+"runtime/process-instances/"+myprocess.processInstanceId+"/identitylinks";

    var options = {
      headers: {"Connection": "close"},
        url: proxy_url,
        method: method,
        json: true,
        body: params
    };

    function callback(error, response, data) {
      console.log(data);
        if (!error && response.statusCode == 201) {
          console.log('添加成功：',data);
          res.json(data);
        }
        if (!error && response.statusCode == 404) {
          console.log(data);
          res.json('notfound');
        }
    }
    request(options, callback);
})

//获取历史流程实例
router.get('/process/history/all', function(req, res){
    var method = "GET";
    var proxy_url = baseUrl+"history/historic-process-instances";

    var options = {
      headers: {"Connection": "close"},
        url: proxy_url,
        method: method,
        json: true
    };

    function callback(error, response, data) {
      console.log(data);
        if (!error && response.statusCode == 200) {
          console.log('历史流程：',data);
          res.json(data.data);
        }
        if (!error && response.statusCode == 400) {
          console.log(data);
          res.json('error');
        }
    }
    request(options, callback);
})

//---------------------------------任务--------------------------------------

//获取任务列表:一个流程实例对应一个任务
router.get('/tasks/all', function(req, res){
    var method = "GET";
    var proxy_url = baseUrl+"runtime/tasks";

    var options = {
      headers: {"Connection": "close"},
        url: proxy_url,
        method: method,
        json: true
    };

    function callback(error, response, data) {
        if (!error && response.statusCode == 200) {
          console.log('任务列表：',data);
          res.json(data);
        }
        if (!error && response.statusCode == 400) {
          console.log(data);
          res.json('error');
        }
    }
    request(options, callback);
})

//更新任务(参数：任务号taskId，其余参数参照params的数据类型)
router.post('/tasks/update', function(req, res){
    var mytask = req.body;
    var method = "PUT";
    var params = {
        "assignee" : mytask.assignee,
        "delegationState" : mytask.delegationState,
        "description" : mytask.description,
        "dueDate" : mytask.dueDate,
        "name" : mytask.name,
        "owner" : mytask.owner
    };
    var proxy_url = baseUrl+"runtime/tasks/"+mytask.taskId;

    var options = {
      headers: {"Connection": "close"},
        url: proxy_url,
        method: method,
        json: true,
        body: params
    };

    function callback(error, response, data) {
      console.log(data);
        if (!error && response.statusCode == 200) {
          console.log('更新任务：',data);
          res.json(data);
        }
        if (!error && response.statusCode == 404) {
          console.log(data);
          res.json('notfound');
        }
    }
    request(options, callback);
})

//操作任务(参数：任务号taskId，操作号operateId,相关用户user)
router.post('/tasks/operate', function(req, res){
    var mytask = req.body;
    var method = "POST";
    if(mytask.operateId=="complete")//完成任务???
        var params = {
            "action" : "complete",
            "variables" : []
        };
    else if(mytask.operateId=="claim")//认领任务
        var params = {
            "action":"claim",
            "assignee":mytask.user
        };
    else if(mytask.operateId=="delegate")//代理任务
        var params = {
            "action":"delegate",
            "assignee":mytask.user
        };
    else if(mytask.operateId=="resolve")//处理任务
        var params = {
            "action":"resolve"
        };
    var proxy_url = baseUrl+"runtime/tasks/"+mytask.taskId;

    var options = {
      headers: {"Connection": "close"},
        url: proxy_url,
        method: method,
        json: true,
        body: params
    };

    function callback(error, response, data) {
      console.log(data);
        if (!error && response.statusCode == 200) {
          console.log('操作成功：',data);
          res.json('success');
        }
        if (!error && response.statusCode == 400) {
          console.log(data);
          res.json('error');
        }
        if (!error && response.statusCode == 404) {
          console.log(data);
          res.json('notfound');
        }
    }
    request(options, callback);
})

//删除任务(参数：任务号taskId)
router.post('/tasks/delete', function(req, res){
    var mytask = req.body;
    var method = "DELETE";
    var proxy_url = baseUrl+"runtime/tasks/"+mytask.taskId;

    var options = {
      headers: {"Connection": "close"},
        url: proxy_url,
        method: method,
        json: true
    };

    function callback(error, response, data) {
        if (!error && response.statusCode == 204) {
          console.log('删除成功：',data);
          res.json(data);
        }
        if (!error && response.statusCode == 403) {
          console.log(data);
          res.json('cannotdelete');
        }
        if (!error && response.statusCode == 404) {
          console.log(data);
          res.json('notfound');
        }
    }
    request(options, callback);
})

//获取历史任务
router.get('/tasks/history/all', function(req, res){
    var method = "GET";
    var proxy_url = baseUrl+"history/historic-task-instances";

    var options = {
      headers: {"Connection": "close"},
        url: proxy_url,
        method: method,
        json: true
    };

    function callback(error, response, data) {
      console.log(data);
        if (!error && response.statusCode == 200) {
          console.log('历史任务：',data);
          res.json(data);
        }
        if (!error && response.statusCode == 400) {
          console.log(data);
          res.json('error');
        }
    }
    request(options, callback);
})

module.exports = router;
