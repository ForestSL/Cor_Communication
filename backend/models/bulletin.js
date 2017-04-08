var mongoose = require('mongoose');

//数据模型BulletinSchema
var BulletinSchema = new mongoose.Schema({
  content: String,
  receiveID: String,//接受公告的部门ID，引用DepartSchema中的departID
  create_at: {
    type: Date,
    default: Date.now
  }
});

//数据模型BulletinSchema通过Bulletin方法名，可被其他module调用
module.exports = mongoose.model("Bulletin", BulletinSchema);