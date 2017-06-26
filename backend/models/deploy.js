var mongoose = require('mongoose');

//部署
var DeploySchema = new mongoose.Schema({
  	deploymentId: {
  		type:String,
  		default:20
  	}
});

module.exports = mongoose.model("Deploy", DeploySchema);