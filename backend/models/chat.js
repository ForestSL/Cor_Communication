var mongoose = require('mongoose');

//数据模型ChatSchema
var ChatSchema = new mongoose.Schema({
  sendId: String,//引用UserSchema中的userID
  receiveId: String,//接受者可以是一个，也可以是一个部门所有成员（群聊）,引用UserSchema中的userID
  content: String,
  create_at: {//发送时间？？
    type: Date,
    default: Date.now
  }
});

//数据模型ChatSchema通过Chat方法名，可被其他module调用
module.exports = mongoose.model("Chat", ChatSchema);