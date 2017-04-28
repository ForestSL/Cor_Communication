var mongoose = require('mongoose');

//数据模型DepartSchema
var DepartSchema = new mongoose.Schema({
  departID: Number,
  departName: String,
  parent: Number,//引用部门ID
  create_at: {
    type: Date,
    default: Date.now
  }
});

//数据模型DepartSchema通过Depart方法名，可被其他module调用
module.exports = mongoose.model("Depart", DepartSchema);