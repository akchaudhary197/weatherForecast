const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const userRegister = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    email : {type : String ,
        required : true,
        unique : true,
     } ,
    password : {type :String , required : true},
    role : {type :String },
    name :  {type : String },
    tokens:[{
        token:{type :String , required : true}
    }]
    
})

module.exports = mongoose.model('Users',userRegister)