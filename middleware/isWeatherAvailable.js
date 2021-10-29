const Weather = require('../models/weather')

const weather = async (req, res, next) => {
    Weather.find({city:req.body.city})
    .select()
    .exec()
    .then(postDetail=>{
        if(postDetail.length === 0 ){
            next();
        }else{
            return res.status(401).json({message:"Data already exist"})
        }
    })
}
module.exports = weather