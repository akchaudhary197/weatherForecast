const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    comment : {type: String},
    created_by:{type :  mongoose.Schema.Types.ObjectId, ref : 'Register', default:null},
    updated_by:{type :  mongoose.Schema.Types.ObjectId, ref : 'Register',default:null},
    deleted_by:{type :  mongoose.Schema.Types.ObjectId, ref : 'Register',default:null},
    created_time:{type: Date, required:false},
    post_id:{type :  mongoose.Schema.Types.ObjectId, ref : 'Post'},
    updated_time:{type: Date, required:true},
    is_deleted:{type:Boolean, default:false},
    deleteAt:{type: Date, required:false, default:null}    
})

module.exports = mongoose.model('Comments',commentSchema)