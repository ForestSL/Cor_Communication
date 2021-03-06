var mongoose = require('mongoose');

//请假(加数据模型存储state:running,complete和result:approve,disapprove)
var TaskSchema = new mongoose.Schema({
    name:{//任务类型，默认请假
      type:String,
      default:"vacation"
    },
  	userID: Number,
  	userName: String,
  	processID: Number,//请假：流程ID，其他：自动生成ID
    id: Number,
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
    },
    //其他使用
    content:{
      type:String,
      default:"null"
    },
    receiver:{
      type:Number,
      default:0
    },
    create_at: {
      type: Date,
      default: Date.now
    }
});

module.exports = mongoose.model("Task", TaskSchema);