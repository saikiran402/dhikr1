var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var JoinSchema = new mongoose.Schema({
    username: String,
    type: String,
    count:Number,
    createdAt: { type: Date, default: Date.now },
});

JoinSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model("Joinus", JoinSchema);


