var mongoose = require('mongoose');

var SafeSchema = new mongoose.Schema({
	adminPhone:String,
	adminState:{
		type:String,
		default:"off"
	}
});

module.exports = mongoose.model("Safe", SafeSchema);