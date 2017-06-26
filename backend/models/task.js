var mongoose = require('mongoose');

//任务
var TaskSchema = new mongoose.Schema({
  	id: String
});

module.exports = mongoose.model("Task", TaskSchema);