const mongoose = require('mongoose');

const books = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    name : {type : String , required : true} , 
    purchased:{type : Boolean, default: false }
})

module.exports = mongoose.model('Book',books)