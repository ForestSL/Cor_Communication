var mongoose = require('mongoose');

//数据模型AdminSchema
var AdminSchema = new mongoose.Schema({
  adminPhone: {
    type: String,
    unique: true
  },
  adminPwd: String,
  create_at: {
    type: Date,
    default: Date.now
  }
});

//数据模型AdminSchema通过Admin方法名，可被其他module调用
module.exports = mongoose.model("Admin", AdminSchema);