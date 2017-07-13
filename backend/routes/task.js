var express = require('express');
var router = express.Router();//定义router获取Router()方法库
var request = require('request');
var Task = require('../models/task');
var Deploy = require('../models/deploy');
var User = require('../models/user');
var Depart = require('../models/depart');
var Count = require('../models/count');
var Safe = require('../models/safe');

var baseUrl="http://kermit:kermit@115.159.38.100:8081/activiti-rest/service/";

/**
 * @swagger
 * definition:
 *   Task:
 *     properties:
 *       name:
 *         type: string
 *       userID:
 *         type: number
 *       userName:
 *         type: string
 *       processID:
 *         type: number
 *       state:
 *         type: string
 *       result:
 *         type: string
 *       content:
 *         type: string
 *       receiver:
 *         type: number
 */

/**
 * @swagger
 * /task:
 *   get:
 *     tags:
 *       - Task
 *     summary: 返回所有请假相关信息
 *     description: 返回所有请假任务
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: 所有请假任务
 *         schema:
 *           $ref: '#/definitions/Task'
 */
//查看task数据
router.get("/", function(req, res, next){//无参数
  Task.find({}, function(err, tests){
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
 *       - Task
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
                      Task.create(vacation, function(err, vas){
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
 *       - Task
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
 *         description: 所有Task对象数据
 *         schema:
 *           $ref: '#/definitions/Task'
 */
//用户当前已有任务列表
router.post('/vacation/list', function(req, res){//参数：userID
  var user = req.body;
  Task.find({userID:user.userID}, function(err, tests){
    if(err){
      return res.status(400).send("err in get /task");
    }else{
      console.log(tests);
      return res.status(200).json(tests);//返回值：包含name,userID,userName,processID,state,result,numOfDays,startTime,motivation等的对象数组
    }
  })
})

/**
 * @swagger
 * /task/vacation/list/detail:
 *   post:
 *     tags:
 *       - Task
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
//app用户根据name点击列表查看请假任务详情
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
 *       - Task
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
 *       - Task
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
 *       - Task
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
            Task.update({processID: data.processInstanceId}, {state: "running",result:"disapprove"}, function (err, vas) {
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
            Task.update({processID: data.processInstanceId}, {state: "complete",result:"approve"}, function (err, vas) {
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
 *       - Task
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
            Task.update({processID: data.processInstanceId}, {state: "complete",result:"disapprove"}, function (err, vas) {
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
            Task.update({processID: data.processInstanceId}, {state: "running",result:"waiting",
              numOfDays:mytask.numOfDays,startTime:mytask.startTime,motivation:mytask.motivation}, function (err, vas) {
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
 *       - Task
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
  Task.remove({processID:user.processID},function(err,users){
    if(err){
      return res.status(400).send("err in post /task/vacation/delete");
    }else{
      return res.status(200).json("success");//返回值
    }
  })
})

//获取流程图（拿不到图？？？）
router.post('/vacation/pic',function(req,res){
    var myprocess=req.body;
    var method = "GET";
    var proxy_url = baseUrl+"runtime/process-instances/"+myprocess.processID;

    var options = {
      headers: {"Connection": "close"},
        url: proxy_url,
        method: method,
        json: true
    };

    function callback(error, response, data) {
        if (!error && response.statusCode == 200) {
          console.log(data);
          res.json(data);//返回值
        }
        if (!error && response.statusCode == 404) {
          console.log(data);
          res.json("notfound");//返回值：notfound
        }
    }
    request(options, callback); 
});

//---------------------------------部署--------------------------------------

 /**
 * @swagger
 * definition:
 *   Deploy:
 *     properties:
 *       name:
 *         type: string
 *       file:
 *         type: string
 */

 /**
 * @swagger
 * /task/deploy:
 *   get:
 *     tags:
 *       - Deploy
 *     summary: 返回所有请假相关信息
 *     description: 返回所有请假任务
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: 所有请假任务
 *         schema:
 *           $ref: '#/definitions/Deploy'
 */
//获取部署列表(无参数)：web端/app端提供可选择的任务name
router.get('/deploy', function(req, res){
  Deploy.find({}, function(err, tests){
    if(err){
      return res.status(400).send("err in get /task/deploy");
    }else{
      console.log(tests);
      return res.status(200).json(tests);//res:包含name、file的对象
    }
  })
});

/**
 * @swagger
 * /task/deploy/upload:
 *   post:
 *     tags:
 *       - Deploy
 *     summary: web端流程部署(登录权限验证)
 *     description: 流程部署
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Deploy(name,file)
 *         description: object
 *         in: body
 *         required: true
 *     responses:
 *       200:
 *         description: success,error
 */
//流程部署(参数：name,file):web端
router.post('/deploy/upload', function(req, res){
  Safe.findOne({adminState:"on"},function(e,r){//是否绑定adminPhone？？？
  if(r==null){
    return res.status(200).json("admin login first");
  }else{
  var deploy=req.body;
  //判断deploy是否为空，空就先创建一条请假部署记录
  Deploy.findOne({},function(e,r){
    if(r==null){
      var va={
        "name":"vacation",
        "file":"default"
      };
      Deploy.create(va,function(e1,r1){
        console.log("vacation added.");
      })
    }
    //创建新的部署
    Deploy.create(deploy,function(e1,r1){
      if (e1) {
        return res.status(400).send("error");
      } else {
        return res.status(200).json("success");//res
      }
    })
  })
  }
  })
});

/**
 * @swagger
 * /task/deploy/delete:
 *   post:
 *     tags:
 *       - Deploy
 *     summary: web端删除部署列表(登录权限验证)
 *     description: 删除部署列表
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Deploy(name)
 *         description: object
 *         in: body
 *         required: true
 *     responses:
 *       200:
 *         description: success
 */
//删除部署列表(参数：name)
router.post('deploy/delete',function(req,res){
    Safe.findOne({adminState:"on"},function(e,r){//是否绑定adminPhone？？？
  if(r==null){
    return res.status(200).json("admin login first");
  }else{
  var deploy=req.body;
  Deploy.remove({name:deploy.name},function(err,result){
    if(err){
      return res.status(400).send("error");
    }else{
      return res.status(200).json("success");//res
    }
  })
}
})
});

/**
 * @swagger
 * /task/process/delete:
 *   post:
 *     tags:
 *       - Task
 *     summary: web端删除流程列表(登录权限验证)
 *     description: 删除流程列表
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Task(processID)
 *         description: object
 *         in: body
 *         required: true
 *     responses:
 *       200:
 *         description: success,notexist,stillrunning
 */
//删除流程列表(参数：processID)
router.post('/process/delete',function(req,res){
    Safe.findOne({adminState:"on"},function(e,r){//是否绑定adminPhone？？？
  if(r==null){
    return res.status(200).json("admin login first");
  }else{
  var myprocess=req.body;
  Task.findOne({processID:myprocess.processID},function(err,result){
    if(err){
      return res.status(400).send("error");
    }else{
      if(result==null){
        return res.status(200).json("notexist");
      }else if(result.state=="running"){
        return res.status(200).json("stillrunning");
      }else{
        //删除数据
        Task.remove({processID:myprocess.processID},function(err1,result1){
          if(err1){
            return res.status(400).send("error");
          }else{
            return res.status(200).json("success");
          }
        })
      }
    }
  })
}
})
});

//---------------------------------其他任务--------------------------------------

/**
 * @swagger
 * /task/other/request:
 *   post:
 *     tags:
 *       - Task
 *     summary: app端启动对应name的任务
 *     description: app端启动对应name的任务
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Task(name,userID,userName,content,receiver)
 *         description: object
 *         in: body
 *         required: true
 *     responses:
 *       200:
 *         description: success
 */
//app端启动对应name的任务(参数：name,userID,userName,content,receiver),processID自动生成
router.post('/other/request',function(req,res){
  var other=req.body;
  //根据Count数据模型自动生成processID
  Count.findOne({}, function (err, counts) {
    other.processID=counts.deployNum+1;
    Count.update({}, {deployNum: counts.deployNum + 1}, function (err, result){
      console.log("deployNum加一");
      //新建任务记录
      Task.create(other, function (err, result) {
        if (err) {
          return res.status(400).send("error");
        } else {
          return res.status(200).json("success");//返回值
        }
      })
    })
  })
});

/**
 * @swagger
 * /task/other/detail:
 *   post:
 *     tags:
 *       - Task
 *     summary: app端点击查看非请假任务详情
 *     description: 点击查看非请假任务详情
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Task(processID)
 *         description: object
 *         in: body
 *         required: true
 *     responses:
 *       200:
 *         description: 任务对象
 */
//点击查看非请假任务详情(参数：processID)
router.post('/other/detail',function(req,res){
  var other=req.body;
  Task.findOne({processID:other.processID},function(err,result){
    if(err){
      return res.status(400).send("error");
    }else{
      return res.status(200).json(result);//返回值
    }
  })
});

/**
 * @swagger
 * /task/handle/list:
 *   post:
 *     tags:
 *       - Task
 *     summary: app端用户待处理的非请假任务列表
 *     description: 用户待处理的非请假任务列表
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Task(userID)
 *         description: object
 *         in: body
 *         required: true
 *     responses:
 *       200:
 *         description: 任务对象数组
 */
//用户待处理的非请假任务列表,与请假待处理同用(参数：userID)
router.post('/other/handle/list',function(req,res){
  var other=req.body;
  Task.find({receiver:other.userID},function(err,result){
    if(err){
      return res.status(400).send("error");
    }else{
      return res.status(200).json(result);//返回值:数组
    }
  })
});

/**
 * @swagger
 * /task/handle/detail:
 *   post:
 *     tags:
 *       - Task
 *     summary: app端查看待处理的非请假任务详情
 *     description: 查看待处理的非请假任务详情
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Task(processID)
 *         description: object
 *         in: body
 *         required: true
 *     responses:
 *       200:
 *         description: 任务对象
 */
//查看待处理的非请假任务详情(参数：processID)
router.post('/other/handle/detail',function(req,res){
  var other=req.body;
  Task.findOne({processID:other.processID},function(err,result){
    if(err){
      return res.status(400).send("error");
    }else{
      return res.status(200).json(result);//返回值：对象
    }
  })
});

/**
 * @swagger
 * /task/handle:
 *   post:
 *     tags:
 *       - Task
 *     summary: app端处理非请假任务
 *     description: 处理非请假任务
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: Task(processID,result(approve/disapprove),motivation)
 *         description: object
 *         in: body
 *         required: true
 *     responses:
 *       200:
 *         description: success
 */
//处理非请假任务(参数：processID,result(approve/disapprove),motivation)
router.post('/other/handle',function(req,res){
  var other=req.body;
  Task.update({processID:other.processID},{state:"complete",result:other.result,motivation:other.motivation},function(err,result){
    if(err){
       return res.status(400).send("error");
     }else{
        return res.status(200).json("success");//返回值
     }
  })
});

module.exports = router;
