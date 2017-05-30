var mongoose = require('mongoose');

//该模型只用于部门、用户ID生成，不可判断实际数量（删除时并不会变化）
var CountSchema = new mongoose.Schema({
  departNum: {
    type: Number,
    default: 0
  },
  userNum: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("Count", CountSchema);