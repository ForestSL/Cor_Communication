var mongoose = require('mongoose');
//var DepartSchema = new mongoose.Schema;

//数据模型BulletinSchema
var BulletinSchema = new mongoose.Schema({
  receiveID: Number,//接受公告的部门ID，引用DepartSchema中的departID
  content: String,
  time: String,//根据时间判断是否删除公告
  create_at: {
    type: Date,
    default: Date.now
  }
});

//数据模型BulletinSchema通过Bulletin方法名，可被其他module调用
module.exports = mongoose.model("Bulletin", BulletinSchema);