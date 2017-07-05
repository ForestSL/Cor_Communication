var mongoose = require('mongoose');

//请假(加数据模型存储state:running,complete和result:approve,disapprove???)
var VacationSchema = new mongoose.Schema({
  	userID: String,
  	userName: String,
  	processID: String,
  	state: {
  		type: String,
  		default: "running"
  	},
  	result: {
  		type: String,
  		default: "waiting"
  	}
});

module.exports = mongoose.model("Vacation", VacationSchema);