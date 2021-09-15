const jwt = require('jsonwebtoken')
const User = require('../models/users')
const auth = async (req, res, next) => {
    try{
        // const token = req.cookies.jwt;
        const token = req.headers.authorization
        const verifyUser = jwt.verify(token,"mynameisAnkitandthisisdummyproject")
        const userData = await User.findOne({_id:verifyUser._id})
        if(verifyUser){
            req.userdata = userData;
            req.user_role = userData.role
            req.userId = userData._id
            req.name = userData.name
            req.email = userData.email
            next()
        }else{
            return res.status(401).json({message:"Auth failed"})
        }
    } catch(error){
        return res.status(401).json({message:"Auth failed"})        
    }
}
module.exports = auth