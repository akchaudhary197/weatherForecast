const mongoose = require('mongoose');

const tasks = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    name : {type : String , required : true} , 
    completed:{type : Boolean, default: false }
})

module.exports = mongoose.model('Task',tasks)