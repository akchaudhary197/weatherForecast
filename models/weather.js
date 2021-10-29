const mongoose = require('mongoose');

const weather = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    city : {type: String, required: true},
    temperature:{type: String, required: true}
})

module.exports = mongoose.model('Weather',weather)