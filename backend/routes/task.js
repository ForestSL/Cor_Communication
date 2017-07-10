var express = require('express');
var router = express.Router();//定义router获取Router()方法库
var request = require('request');
var Vacation = require('../models/vacation');
var User = require('../models/user');
var Depart = require('../models/depart');

var baseUrl="http://kermit:kermit@115.159.38.100:8081/activiti-rest/service/";

/**
 * @swagger
 * definition:
 *   Vacation:
 *     properties:
 *       userID:
 *         type: string
 *       userName:
 *         type: string
 *       processID:
 *         type: string
 *       state:
 *         type: string
 *       result:
 *         type: string
 */

/**
 * @swagger
 * /task:
 *   get:
 *     tags:
 *       - Vacation
 *     summary: 返回所有请假相关信息
 *     description: 返回所有请假任务
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: 所有请假任务
 *         schema:
 *           $ref: '#/definitions/Vacation'
 */
//查看vacation数据
router.get("/", function(req, res, next){//无参数
  Vacation.find({}, function(err, tests){
    if(err){
      return res.status(400).send("err in get /task");
    }else{
      console.log(tests);
      return res.status(200).json(tests);//res
    }
  })
});

//---------------------------------请假--------------------------------------

/**
 * @swagger
 * /task/vacation/request:
 *   post:
 *     tags:
 *       - Vacation
 *     summary: app用户启动请假流程
 *     description: 用户启动请假流程
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: object(userID,userName,numOfDays,startTime,motivation)
 *         description: object
 *         in: body
 *         required: true
 *     responses:
 *       200:
 *         description: success,fail,error
 */
//启动请假任务:启动请假流程实例、存储流程实例ID至数据库、设置任务的初始处理人（部长）
router.post('/vacation/request', function(req, res){//参数：userID,userName,numOfDays,startTime,motivation
    var vacation = req.body;
    var processInstanceId;
    var taskID;
    var method = "POST";
    var proxy_url = baseUrl+"runtime/process-instances";
    var params = {
            "processDefinitionId":"vacationRequest:1:31",//请假流程
            "variables": [
              {
                "name":"employeeName",
                "value":vacation.userID//便于处理assignee
              },{
                "name":"numberOfDays",
                "value":vacation.numOfDays
              },{
                "name":"startDate",
                "value":vacation.startTime
              },{
                "name":"vacationMotivation",
                "value":vacation.motivation
              }
            ]
        };
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
          processInstanceId = data.id;//获取流程实例ID

                    //存储到数据库
                      vacation.processID = processInstanceId;
                      Vacation.create(vacation, function(err, vas){
                      if (err) {
                        console.log("err in post /task/vacation/request");
                        //return res.status(400).send("err in post /task/vacation/request");
                      } else {
                        console.log("success");
                        //return res.status(200).json("success");//返回值：success
                      }
                    })

          //根据流程实例ID获取对应任务ID
          var method2 = "GET";
          var proxy_url2 = baseUrl+"runtime/tasks?processInstanceId="+processInstanceId;
          var options2 = {
            headers: {"Connection": "close"},
            url: proxy_url2,
            method: method2,
            json: true
          };
          function callback2(error2, response2, data2) {
            //console.log(data);
            if (!error2 && response2.statusCode == 200) {
              console.log(data2.data[0].id);
              //res.json(data2.data[0].id);
              taskID=data2.data[0].id;//获取任务ID

          //设置该任务的处理人assignee为部长
          var assignee;
          User.findOne({userID: vacation.userID}, function (err, users) {
            if (err) {
              //console.log(data2);
              return res.status(400).send("err in post /task/vacation/request");
            } else {
              //console.log(users.userDepart);
              Depart.findOne({departID:users.userDepart},function(err2, departs){
                if(err2){
                  return res.status(400).send("error");
                }else{
                  assignee=departs.leaderID;//获取部长ID（处理人ID）
                  console.log("assignee:");
                  console.log(assignee);
                  console.log(taskID);

                  var method3 = "PUT";
                  var proxy_url3 = baseUrl+"runtime/tasks/"+taskID;
                  var params3 = {
                   "assignee":assignee
                  };

                  var options3 = {
                   headers: {"Connection": "close"},
                   url: proxy_url3,
                   method: method3,
                   json: true,
                   body: params3
                  };

                  function callback3(error3, response3, data3) {
                    console.log(data3);
                    if (!error3 && response3.statusCode == 200) {
                      console.log("success"); 
                      res.json("success");//返回值：success
                  }
                } 
                request(options3, callback3);

                }
              })
            }
          })

            }
          }
          request(options2, callback2); 

        }
        if (!error && response.statusCode == 400) {
          console.log('启动失败：',data);
          res.json("fail");//返回值：fail
        }
    }
    request(options, callback);
})

/**
 * @swagger
 * /task/vacation/list:
 *   post:
 *     tags:
 *       - Vacation
 *     summary: app用户当前已有任务列表
 *     description: 用户当前任务列表
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: object(userID)
 *         description: object
 *         in: body
 *         required: true
 *     responses:
 *       200:
 *         description: 所有vacation对象数据
 *         schema:
 *           $ref: '#/definitions/Vacation'
 */
//用户当前已有任务列表
router.post('/vacation/list', function(req, res){//参数：userID
  var user = req.body;
  Vacation.find({userID:user.userID}, function(err, tests){
    if(err){
      return res.status(400).send("err in get /task");
    }else{
      console.log(tests);
      return res.status(200).json(tests);//返回值：包含userID,userName,processID,state,result的对象数组
    }
  })
})

/**
 * @swagger
 * /task/vacation/list/detail:
 *   post:
 *     tags:
 *       - Vacation
 *     summary: app用户点击任务列表查看详情
 *     description: 任务详情
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: object(processID)
 *         description: object
 *         in: body
 *         required: true
 *     responses:
 *       200:
 *         description: 任务对象数据
 */
//点击列表查看任务详情
router.post('/vacation/list/detail', function(req, res){//参数：processID
    var pa = req.body;
    var method = "GET";
    var proxy_url = baseUrl+"runtime/tasks?processInstanceId="+pa.processID;

    var options = {
        headers: {"Connection": "close"},
        url: proxy_url,
        method: method,
        json: true
    };

    function callback(error, response, data) {
      //console.log(data);
        if (!error && response.statusCode == 200) {
          console.log(data.data[0]);
          res.json(data.data[0]);//返回值：包含name(任务阶段),description(处理userID成userName???),createTime的对象
        }
        if (!error && response.statusCode == 400) {
          console.log(data);
          res.json("fail");//返回值：fail
        }
    }
    request(options, callback);
})

/**
 * @swagger
 * /task/vacation/handle/list:
 *   post:
 *     tags:
 *       - Vacation
 *     summary: app用户当前待处理任务列表
 *     description: 待处理任务
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: object(userID)
 *         description: object
 *         in: body
 *         required: true
 *     responses:
 *       200:
 *         description: 任务对象数据数组,fail 
 */
//用户当前待处理任务列表
router.post('/vacation/handle/list', function(req, res){//参数：userID
          var user=req.body;
          //根据assignee查找任务列表
          var method = "GET";
          var proxy_url = baseUrl+"runtime/tasks?assignee="+user.userID;

          var options = {
            headers: {"Connection": "close"},
            url: proxy_url,
            method: method,
            json: true
          };

          function callback(error, response, data) {
            //console.log(data);
            if (!error && response.statusCode == 200) {
              console.log(data.data);
              res.json(data.data);//返回值：包含id,name的对象数组
            }
            if (!error && response.statusCode == 400) {
              console.log(data);
              res.json("fail");//返回值：fail
            }
          }
          request(options, callback);
})

/**
 * @swagger
 * /task/vacation/handle/detail:
 *   post:
 *     tags:
 *       - Vacation
 *     summary: app用户点击待处理任务列表查看详情
 *     description: 待处理任务详情
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: object(id)
 *         description: object
 *         in: body
 *         required: true
 *     responses:
 *       200:
 *         description: 待处理任务对象数据
 */
//点击列表查看待处理任务详情
router.post('/vacation/handle/detail', function(req, res){//参数：id
    var mytask = req.body;
    var method = "GET";
    var proxy_url = baseUrl+"runtime/tasks/"+mytask.id;

    var options = {
      headers: {"Connection": "close"},
        url: proxy_url,
        method: method,
        json: true
    };

    function callback(error, response, data) {
        if (!error && response.statusCode == 200) {
          console.log(data);
          res.json(data);//返回值：包含createTime,description(处理userID和userName相关),id,name的对象
        }
        if (!error && response.statusCode == 404) {
          console.log(data);
          res.json("notfound");//返回值：notfound
        }
    }
    request(options, callback); 
})

/**
 * @swagger
 * /task/vacation/handlerequest:
 *   post:
 *     tags:
 *       - Vacation
 *     summary: app用户处理Handle vacation request任务
 *     description: 处理任务
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: object(id,approve(true/false),motivation)
 *         description: object
 *         in: body
 *         required: true
 *     responses:
 *       200:
 *         description: success,fail,notfound
 */
//处理name为Handle vacation request的任务
router.post('/vacation/handlerequest', function(req, res){//参数：id,approve(true/false),motivation
  //根据任务ID获取流程ID
    var mytask = req.body;
    var method = "GET";
    var proxy_url = baseUrl+"runtime/tasks/"+mytask.id;

    var options = {
      headers: {"Connection": "close"},
        url: proxy_url,
        method: method,
        json: true
    };

    function callback(error, response, data) {
        if (!error && response.statusCode == 200) {
          console.log(data.processInstanceId);//获取流程实例id
          //res.json(data);
          if(mytask.approve=="false"){//拒绝请假
            Vacation.update({processID: data.processInstanceId}, {state: "running",result:"disapprove"}, function (err, vas) {
              if (err) {
                return res.status(400).send("err in post /task/vacation/handlerequest");
              } else {
                console.log("更新成功");
                //return res.status(200).json("success");//res
                var method1 = "POST";
                var proxy_url1 = baseUrl+"runtime/tasks/"+mytask.id;
                var params1={
                  "action":"complete",
                  "variables":[
                    {
                      "name":"vacationApproved",
                      "value":mytask.approve
                    },{
                      "name":"managerMotivation",
                      "value":mytask.motivation
                    }
                  ]
                };

                var options1 = {
                  headers: {"Connection": "close"},
                  url: proxy_url1,
                  method: method1,
                  json: true,
                  body: params1
                };

                function callback1(error1, response1, data1) {
                  if (!error1 && response1.statusCode == 200) {
                    //console.log(data); 
                    res.json("success");
                  }else{
                    res.json("fail");
                  }
                }
                request(options1, callback1);
              }
            })
          }else if(mytask.approve=="true"){//同意请假
            Vacation.update({processID: data.processInstanceId}, {state: "complete",result:"approve"}, function (err, vas) {
              if (err) {
                return res.status(400).send("err in post /task/vacation/handlerequest");
              } else {
                console.log("更新成功");
                //return res.status(200).json("success");//res
                var method1 = "POST";
                var proxy_url1 = baseUrl+"runtime/tasks/"+mytask.id;
                var params1={
                  "action":"complete",
                  "variables":[
                    {
                      "name":"vacationApproved",
                      "value":mytask.approve
                    },{
                      "name":"managerMotivation",
                      "value":mytask.motivation
                    }
                  ]
                };

                var options1 = {
                  headers: {"Connection": "close"},
                  url: proxy_url1,
                  method: method1,
                  json: true,
                  body: params1
                };

                function callback1(error1, response1, data1) {
                  if (!error1 && response1.statusCode == 200) {
                    //console.log(data); 
                    res.json("success");
                  }else{
                    res.json("fail");
                  }
                }
                request(options1, callback1);
              }
            })
          }

        }
        if (!error && response.statusCode == 404) {
          console.log(data);
          res.json("notfound");//返回值：notfound
        }
    }
    request(options, callback);  
})

/**
 * @swagger
 * /task/vacation/adjustrequest:
 *   post:
 *     tags:
 *       - Vacation
 *     summary: app用户处理Adjust vacation request任务
 *     description: 处理任务
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: object(userID,id,numOfDays,startTime,motivation,send)
 *         description: object
 *         in: body
 *         required: true
 *     responses:
 *       200:
 *         description: success,fail,notfound
 */
//处理name为Adjust vacation request的任务
router.post('/vacation/adjustrequest', function(req, res){//参数：userID,id,numOfDays,startTime,motivation,send
  //根据原先任务ID获取流程ID
    var mytask = req.body;
    var method = "GET";
    var proxy_url = baseUrl+"runtime/tasks/"+mytask.id;

    var options = {
      headers: {"Connection": "close"},
        url: proxy_url,
        method: method,
        json: true
    };

    function callback(error, response, data) {
        if (!error && response.statusCode == 200) {
          console.log(data.processInstanceId);//获取到流程ID
          //res.json(data);
          //更新数据模型
          if(mytask.send=="false"){//不再重发
            Vacation.update({processID: data.processInstanceId}, {state: "complete",result:"disapprove"}, function (err, vas) {
              if (err) {
                return res.status(400).send("err in post /task/vacation/adjustrequest");
              } else {
                console.log("更新成功");
                //return res.status(200).json("success");//res
                //处理任务
                var method1 = "POST";
                var proxy_url1 = baseUrl+"runtime/tasks/"+mytask.id;
                var params1={
                  "action":"complete",
                  "variables":[
                    {
                      "name":"numberOfDays",
                      "value":mytask.numOfDays
                    },{
                      "name":"startDate",
                      "value":mytask.startTime
                    },{
                      "name":"vacationMotivation",
                      "value":mytask.motivation
                    },{
                      "name":"resendRequest",
                      "value":mytask.send
                    }
                  ]
                };

                var options1 = {
                  headers: {"Connection": "close"},
                  url: proxy_url1,
                  method: method1,
                  json: true,
                  body: params1
                };

                function callback1(error1, response1, data1) {
                  if (!error1 && response1.statusCode == 200) {
                    console.log(data); 
                    res.json("success");//返回值
                  }else{
                    res.json("fail");//返回值
                  }
                }
                request(options1, callback1);
              }
            })
          }else if(mytask.send == "true"){//重发
            Vacation.update({processID: data.processInstanceId}, {state: "running",result:"waiting"}, function (err, vas) {
              if (err) {
                return res.status(400).send("err in post /task/vacation/adjustrequest");
              } else {
                console.log("更新成功");
                //return res.status(200).json("success");//res
                //处理任务
                var method1 = "POST";
                var proxy_url1 = baseUrl+"runtime/tasks/"+mytask.id;
                var params1={
                  "action":"complete",
                  "variables":[
                    {
                      "name":"numberOfDays",
                      "value":mytask.numOfDays
                    },{
                      "name":"startDate",
                      "value":mytask.startTime
                    },{
                      "name":"vacationMotivation",
                      "value":mytask.motivation
                    },{
                      "name":"resendRequest",
                      "value":mytask.send
                    }
                  ]
                };

                var options1 = {
                  headers: {"Connection": "close"},
                  url: proxy_url1,
                  method: method1,
                  json: true,
                  body: params1
                };

                function callback1(error1, response1, data1) {
                  if (!error1 && response1.statusCode == 200) {
                    //console.log(data1); 
                    //res.json("success");
                    //根据流程ID获取新的任务ID
                    var method2 = "GET";
                    var proxy_url2 = baseUrl+"runtime/tasks?processInstanceId="+data.processInstanceId;

                    var options2 = {
                      headers: {"Connection": "close"},
                      url: proxy_url2,
                      method: method2,
                      json: true
                    };

                    function callback2(error2, response2, data2) {
                      //console.log(data);
                      if (!error2 && response2.statusCode == 200) {
                        console.log(data2.data[0].id);//获取新的任务id
                        //res.json(data2.data[0]);
                        //根据任务ID更新assignee(根据用户ID确认部长ID)
                        //设置该任务的处理人assignee为部长
                        var assignee;
                        User.findOne({userID: mytask.userID}, function (err, users) {
                          if (err) {
                            //console.log(data2);
                            return res.status(400).send("err in post /task/vacation/adjustrequest");
                          } else {
                            //console.log(users.userDepart);
                            Depart.findOne({departID:users.userDepart},function(err2, departs){
                              if(err2){
                                return res.status(400).send("error");
                              }else{
                                assignee=departs.leaderID;//获取部长ID（处理人ID）
                                console.log("assignee:");
                                console.log(assignee);
                                console.log(data2.data[0].id);

                                var method3 = "PUT";
                                var proxy_url3 = baseUrl+"runtime/tasks/"+data2.data[0].id;
                                var params3 = {
                                  "assignee":assignee
                                };

                                var options3 = {
                                  headers: {"Connection": "close"},
                                  url: proxy_url3,
                                  method: method3,
                                  json: true,
                                  body: params3
                                };

                                function callback3(error3, response3, data3) {
                                  console.log(data3);
                                  if (!error3 && response3.statusCode == 200) {
                                    console.log("success"); 
                                    res.json("success");//返回值：success
                                  }
                                } 
                                request(options3, callback3);
                              }
                            })
                          }
                        })
                      }
                      if (!error2 && response2.statusCode == 400) {
                        console.log(data2);
                        res.json("fail");//返回值：fail
                      }
                    }
                    request(options2, callback2);
                  }else{
                    res.json("fail");
                  }
                }
                request(options1, callback1);
              }
            })
          }
        }
        if (!error && response.statusCode == 404) {
          console.log(data);
          res.json("notfound");//返回值：notfound
        }
    }
    request(options, callback); 
})

/**
 * @swagger
 * /task/vacation/delete:
 *   post:
 *     tags:
 *       - Vacation
 *     summary: app用户删除任务列表中的任务
 *     description: 删除任务
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: object(processID)
 *         description: object
 *         in: body
 *         required: true
 *     responses:
 *       200:
 *         description: success
 */
//删除用户列表任务
router.post('/vacation/delete',function(req,res){//参数：processID
  var user=req.body;
  Vacation.remove({processID:user.processID},function(err,users){
    if(err){
      return res.status(400).send("err in post /task/vacation/delete");
    }else{
      return res.status(200).json("success");//返回值
    }
  })
})

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

//获取任务列表
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
          res.json(data.data);
        }
        if (!error && response.statusCode == 400) {
          console.log(data);
          res.json('error');
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
          res.json('success');
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
          res.json(data.data);
        }
        if (!error && response.statusCode == 400) {
          console.log(data);
          res.json('error');
        }
    }
    request(options, callback);
})

module.exports = router;
