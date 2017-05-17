var mongoose = require('mongoose');

//数据模型TaskSchema
var TaskSchema = new mongoose.Schema({
  taskID: Number,//1:请假 2:工作任务
  authorID: Number,//当前任务发起人
  authorDepart: Number,//发起人部门,用于找部长
  taskBegin: String,
  taskEnd: String,
  content: String,
  taskState: Number,//1:待处理 2：通过 3：驳回
  create_at: {
    type: Date,
    default: Date.now
  }
});

//数据模型UserSchema通过User方法名，可被其他module调用
module.exports = mongoose.model("Task", TaskSchema);