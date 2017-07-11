var mongoose = require('mongoose');

//请假(加数据模型存储state:running,complete和result:approve,disapprove)
var VacationSchema = new mongoose.Schema({
  	userID: Number,
  	userName: String,
  	processID: Number,
  	state: {
  		type: String,
  		default: "running"
  	},
  	result: {
  		type: String,
  		default: "waiting"
  	},
    numOfDays: Number,
    startTime: String,
    motivation:{
      type: String,
      default: "null"
    }
});

module.exports = mongoose.model("Vacation", VacationSchema);