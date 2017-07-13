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
  userPicture: {
    type: String,
    default: "null"
  },
  userPhone: String,
  userPwd: String,
  userDepart: {
    type: Number,
    default: 0
  },//部门ID引用
  DepartName: {
    type: String,
    default: "null"
  },//以后直接添加到部门中
  isLeader: {
    type: Number,
    default: 0
  },//部长部门ID，普通部员为0
  state:{
    type: String,
    default: "on"
  }//用户状态，启用on，禁用off
});

//数据模型UserSchema通过User方法名，可被其他module调用
module.exports = mongoose.model("User", UserSchema);