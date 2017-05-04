var mongoose = require('mongoose');

//数据模型AdminSchema
var AdminSchema = new mongoose.Schema({
  adminPhone: String,
  adminPwd: String,
  create_at: {
    type: Date,
    default: Date.now
  }
});

//数据模型UserSchema通过User方法名，可被其他module调用
module.exports = mongoose.model("Admin", AdminSchema);