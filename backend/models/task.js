var mongoose = require('mongoose');

//数据模型TaskSchema
var TaskSchema = new mongoose.Schema({
  //使用Activity工作流，学习网址：http://blog.csdn.net/xyw591238/article/details/51545508
  create_at: {
    type: Date,
    default: Date.now
  }
});

//数据模型TaskSchema通过Task方法名，可被其他module调用
module.exports = mongoose.model("Task", TaskSchema);