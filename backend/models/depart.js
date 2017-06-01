var mongoose = require('mongoose');

//数据模型DepartSchema
var DepartSchema = new mongoose.Schema({
  departID: {
  	type: Number,
  	unique: true
  },
  departName: String,
  parentID: Number,//引用部门ID
  parentName: String,
  leaderID: {//领导ID及名称初始值
    type: Number,
    default: 0
  },
  leaderName: {
    type: String,
    default: "null"
  },
  create_at: {
    type: Date,
    default: Date.now
  }
});

//数据模型DepartSchema通过Depart方法名，可被其他module调用
module.exports = mongoose.model("Depart", DepartSchema);