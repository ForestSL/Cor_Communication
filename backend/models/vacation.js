var mongoose = require('mongoose');

//请假
var VacationSchema = new mongoose.Schema({
  	userID: String,
  	userName: String,
  	processID: String
});

module.exports = mongoose.model("Vacation", VacationSchema);