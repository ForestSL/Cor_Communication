var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var swaggerJSDoc = require('swagger-jsdoc');//swagger ui
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

var cors = require('cors');
//声明用户模型
var user = require('./routes/user');
//声明部门模型
var depart = require('./routes/depart');
//声明公告模型
var bulletin = require('./routes/bulletin');
var admin = require('./routes/admin');
var task = require('./routes/task');
var test = require('./routes/test');
//var mylib = require('./routes/mylib');
var count = require('./routes/count');

//声明要用的融云模块
var rongcloudSDK = require( 'rongcloud-sdk' );
//初始化
rongcloudSDK.init( '0vnjpoad0cfoz', '0CIgItfwjE9jGZ' );


var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/3a_info', function(err) {
  if (err) {
    console.log('connection error', err);
  } else {
    console.log('connection successful');
  }
});

//swagger网站访问http://115.159.38.100:3000/swagger.json
// swagger definition
var swaggerDefinition = {
  info: {
    title: '企业内部沟通',
    version: '1.0.0',
    description: '企业内部沟通后台API设计',
  },
  host: '115.159.38.100:3000',
  //host: 'localhost:3000',
  basePath: 'http://115.159.38.100:3000',
  //basePath: '/',
};

// options for the swagger docs
var options = {
  // import swaggerDefinitions
  swaggerDefinition: swaggerDefinition,
  // path to the API docs
  apis: ['./routes/*.js'],
};

// initialize swagger-jsdoc
var swaggerSpec = swaggerJSDoc(options);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser('sessiontest'));
app.use(session({
  store: new MongoStore({
    url: "mongodb://localhost/test_session"//新建数据库
  }),
  cookie: { maxAge: 1 * 60 * 60 * 1000 }, //默认1小时
  secret: 'sessiontest',
  resave: false,
  saveUninitialized: true
}));

app.use('/', index);
app.use('/users', users);

app.use(cors());//使用跨域请求库
//使用用户模型
app.use('/user', user);
//使用部门模型
app.use('/depart', depart);
//使用公告模型
app.use('/bulletin', bulletin);
app.use('/admin', admin);
app.use('/task', task);
app.use('/test', test);
//app.use('/mylib', mylib);
app.use('/count', count);

// serve swagger
app.get('/swagger.json', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
