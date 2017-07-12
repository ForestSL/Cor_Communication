var mongoose = require('mongoose');

//部署:请假默认显示
var DeploySchema = new mongoose.Schema({
  name:String,
  file:String
});

module.exports = mongoose.model("Deploy", DeploySchema);
