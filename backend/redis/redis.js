var ioRedis = require('ioredis');
//var logger = require('logger');
var redis = new ioRedis();

redis.on("error", function (error) {
    console.log(error);
});
exports.redis = redis;