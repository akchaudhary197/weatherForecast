const mongoose = require('mongoose');

const product = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    quantity:{type:Number, required:true},
    location: {type : Array , required : true}
})

module.exports = mongoose.model('Product',product)