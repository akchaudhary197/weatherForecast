const Post = require('../models/post')

const auth = async (req, res, next) => {
    Post.find({_id:req.params.postId})
    .select('created_by')
    .exec()
    .then(postDetail=>{
        if(postDetail.length <= 0 ){
            return res.status(401).json({message:"No post available"})
        }
        if(String(postDetail[0]['created_by']) == String(req.userId) ){
            next()
        }else{
            return res.status(401).json({message:"Auth failed"})
        }
    })
}
module.exports = auth