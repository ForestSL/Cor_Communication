var mongoose = require('mongoose');
//var DepartSchema = new mongoose.Schema;

//数据模型BulletinSchema
var BulletinSchema = new mongoose.Schema({
  departID: Number,
  departName: String,
  name: String,//公告名字
  content: String,
  time: String,//唯一标识
  html: String,
  delta: String,
  state: {
  	type: String,//公告状态，已读read，未读unread
  	default: "unread"
  }
});

//数据模型BulletinSchema通过Bulletin方法名，可被其他module调用
module.exports = mongoose.model("Bulletin", BulletinSchema);