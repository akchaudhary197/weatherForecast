const mongoose = require('mongoose');

const product = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    name : {type : String , required : true} , 
    category:{type : String , required : true} , 
    location: {type : Array , required : true}
})

module.exports = mongoose.model('Product',product)