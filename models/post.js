const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    post : {type: String},
    created_by:{type :  mongoose.Schema.Types.ObjectId, ref : 'Register'},
    updated_by:{type :  mongoose.Schema.Types.ObjectId, ref : 'Register'},
    deleted_by:{type :  mongoose.Schema.Types.ObjectId, ref : 'Register'},
    created_time:{type: Date, required:true},
    updated_time:{type: Date, required:true},
    is_deleted:{type:Boolean, default:false},
    deleteAt:{type: Date, required:false, default:null}    
})

module.exports = mongoose.model('Post',postSchema)