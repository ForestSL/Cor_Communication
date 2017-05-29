var mongoose = require('mongoose');
//var DepartSchema = new mongoose.Schema;

//数据模型BulletinSchema
var BulletinSchema = new mongoose.Schema({
  departID: Number,
  departName: String,
  name: String,//公告名字
  content: String,
  time: String
});

//数据模型BulletinSchema通过Bulletin方法名，可被其他module调用
module.exports = mongoose.model("Bulletin", BulletinSchema);