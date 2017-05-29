var mongoose = require('mongoose');
var DepartSchema = new mongoose.Schema;
var ChatSchema = new mongoose.Schema;

//数据模型UserSchema
var UserSchema = new mongoose.Schema({
  userID: {
    type: Number,
    unique: true
  },
  userName: String,
  userToken:String,
  userPicture:String,
  userPhone: String,
  userPwd: String,
  userDepart: Number,//部门ID引用
  DepartName: String,
  isLeader: Number,//部长部门ID，普通部员为0
  create_at: {
    type: Date,
    default: Date.now
  }
});

//数据模型UserSchema通过User方法名，可被其他module调用
module.exports = mongoose.model("User", UserSchema);