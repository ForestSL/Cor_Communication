var mongoose = require('mongoose');

//数据模型UserSchema
var UserSchema = new mongoose.Schema({
  userId: String,
  userName: String,
  userPwd: String,
  userDepart: String,//引用DepartSchema中的DepartId
  create_at: {
    type: Date,
    default: Date.now
  }
});

//数据模型UserSchema通过User方法名，可被其他module调用
module.exports = mongoose.model("User", UserSchema);