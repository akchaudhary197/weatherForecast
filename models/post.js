const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    title : {type: String, required: true},
    body : {type: String, require: true},
    active:{type: String, require: true},
    created_by:{type :  mongoose.Schema.Types.ObjectId, ref : 'User'},
    updated_by:{type :  mongoose.Schema.Types.ObjectId, ref : 'User'},
    deleted_by:{type :  mongoose.Schema.Types.ObjectId, ref : 'User'},
    created_time:{type: Date, required:true},
    updated_time:{type: Date, required:true},
    is_deleted:{type:Boolean, default:false},
    location:{ type : Object },
    deleteAt:{type: Date, required:false, default:null}    
})

module.exports = mongoose.model('Post',postSchema)