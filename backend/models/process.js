var mongoose = require('mongoose');

//流程实例
var ProcessSchema = new mongoose.Schema({
  	id: String
});

module.exports = mongoose.model("Process", ProcessSchema);