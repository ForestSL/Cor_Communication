var mongoose = require('mongoose');
var DepartSchema = new mongoose.Schema;
var ChatSchema = new mongoose.Schema;

//数据模型UserSchema
var UserSchema = new mongoose.Schema({
  userID: Number,
  userName: String,
  userPhone: String,
  userPwd: String,
  userDepart: Number,//引用DepartSchema中的DepartId
  chatInfo: ChatSchema,//引用ChatSchema
  create_at: {
    type: Date,
    default: Date.now
  }
});

//数据模型UserSchema通过User方法名，可被其他module调用
module.exports = mongoose.model("User", UserSchema);