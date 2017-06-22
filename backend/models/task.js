var mongoose = require('mongoose');

//数据模型TaskSchema
var TaskSchema = new mongoose.Schema({
  deploymentId:String//部署ID
});

//数据模型UserSchema通过User方法名，可被其他module调用
module.exports = mongoose.model("Task", TaskSchema);