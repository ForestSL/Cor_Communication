var mongoose = require('mongoose');
//var DepartSchema = new mongoose.Schema;

//数据模型BulletinSchema
var BulletinSchema = new mongoose.Schema({
  departName: String,
  name: String,//公告名字
  content: String,
  time: { //根据时间判断是否删除公告
  	type: Date,
  	unique: true
  }
});

//数据模型BulletinSchema通过Bulletin方法名，可被其他module调用
module.exports = mongoose.model("Bulletin", BulletinSchema);