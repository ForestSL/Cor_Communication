//程序员测试用
var mongoose = require('mongoose');

var TestSchema = new mongoose.Schema({
	info:String
});

module.exports = mongoose.model("Test", TestSchema);