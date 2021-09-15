var express = require('express');
// const { Mongoose } = require('mongoose');
var app = express();
const jwt = require('jsonwebtoken')
const auth = require('./middleware/auth')
const validateUser = require('./middleware/validateLoginUser')
const User = require('./models/users')
const Post =  require('./models/post')
const isValidCoordinates = require('is-valid-coordinates')

const bcrypt = require('bcrypt')
var validator = require("email-validator");

app.use(express.json())


const mongoose = require('mongoose'); 
const { validate } = require('./models/users');
mongoose.connect("mongodb+srv://dummy:Ankit@123@cluster0.85bmm.mongodb.net/dummy?retryWrites=true&w=majority",{
    useNewUrlParser:true
})


app.post('/signup', async (req,res)=>{
    try{
        var hashPassword
        var inputJson = req.body
        if(inputJson.hasOwnProperty('email')){
            if(!validator.validate(req.body.email)){
                return res.status(500).json({message:'Please enter valid email id.'})
            }
        }else{
            return res.status(500).json({message:'Email field is required.'})
        }
        if( inputJson.hasOwnProperty( 'name' ) ) {
            if(req.body.name.trim().length <= 0 ) {
                return res.status(500).json({message:'User name not be empty space.'})
            }
        }else{
            return res.status(500).json({message:'Name field is required.'})
        }
        if( inputJson.hasOwnProperty( 'password' ) ) {
            if(req.body.password.trim().length <8 ){
                return res.status(500).json({message:'Password length must be of greater than seven.'})
            }
        }else{
            return res.status(500).json({message:'Password field is required.'})
        }
        if( !inputJson.hasOwnProperty( 'confirm_password' ) ) {
            return res.status(500).json({message:'Confirm Password field is required.'})
        }
        User.find({email:req.body.email})
        .exec()
        .then( async user => {
            if (user.length >= 1) {
                return res.status(500).json({
                    message: 'The email address you have entered is already associated with another account.'
                })
            }
            if( req.body.password == req.body.confirm_password ) 
            {
                var inputPassword = req.body.password
                await bcrypt.hash(inputPassword, 10, async (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            message: err
                        })
                    }
                    if(!err){
                        hashPassword = hash
                        const registerUser = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email:req.body.email,
                            password:hashPassword,
                            name:req.body.name
                        })
                        try{
                            const newToken = jwt.sign({_id:registerUser._id.toString()},"mynameisAnkitandthisisdummyproject")
                            registerUser.tokens = registerUser.tokens.concat({token:newToken})
                            registerUser.save()
                            return res.status(200).json( {
                                user_id:registerUser._id
                            } )   
                        }catch(error){
                            res.send(error)
                        }    
                    }
                })                
        }else{
            return res.status(500).json({message:"password not match"})
        }
    })
    }catch(error){
        return res.status(400).send(error);
    }
})

// login auth token expired in 2 min if you want to chnage then just replace in line number 115 =>   { expiresIn: minutes * 60 }
app.post('/login' , async (req, res) => {
    var password = req.body.password
        try{
            const userData = await User.findOne({email:req.body.email})
            if(!userData || Object.keys(userData).length<=0){
                return res.status(401).json({message:"invalid email id"})
            }
            isMatch = await bcrypt.compare(password,userData.password)
            if(!isMatch){
                return res.status(401).json({message:'incorrect password'})
            }else{
                const token = jwt.sign({_id:userData._id.toString()},"mynameisAnkitandthisisdummyproject",{ expiresIn: 60 * 60 })
                userData.tokens = userData.tokens.concat({token:token})
                return res.status(200).json({
                    message: {
                        token:token,
                        email:userData.email,
                        name:userData.name,
                        user_id: userData._id
                    }
                })
            }
            
        }catch(error){
            res.send(error)
        }
})

// Title
// - Body
// - Created By
// - Active/Inactive
// - Geo location (latitude and longitude)


app.post('/post',[auth], (req,res)=> {  
    var inputJson = req.body
    if(!inputJson.hasOwnProperty('title')){
        return res.status( 500 ).json( {
            message:"title field is required."
        } )
    }
    if ( inputJson.title.trim().length === '' ) {
        return res.status( 500 ).json( {
            message:"title not be empty string"
        } )
    }
    if(!inputJson.hasOwnProperty('body')){
        return res.status( 500 ).json( {
            message:"body field is required."
        } )
    }
    if ( inputJson.body.trim().length === '' ) {
        return res.status( 500 ).json( {
            message:"title not be empty string"
        } )
    }
    var location = {}
    if(inputJson.hasOwnProperty('location')){
        if(!validateLocation(location, inputJson, res)){
            return
        }
    }
    Post.find({name:inputJson.title})
        .count()
        .then(postCount=>{
            if(postCount > 0){
                return res.status(500).json({
                    message:"Post already exist."
                })
            }else{
                const newPost = new Post( {
                    _id: new mongoose.Types.ObjectId(),
                    title : inputJson.title,
                    body:inputJson.body,
                    created_by: req.userId,
                    active : req.body.active || true,
                    location:location,
                    created_time:Date.now(),
                    updated_time:Date.now()
                } )
                newPost.save()
                return res.status( 200 ).json( {
                    message: {
                        _id:newPost._id,
                    }
                } )
            }
        })
 } )

 function validateLocation(location, inputJson, res){
        var latitude = 0
        var longitude = 0
        if(!inputJson.location.hasOwnProperty('longitude') || !inputJson.location.hasOwnProperty('latitude') ){
            res.status( 500 ).json( {
                message:"location's field longitude and latitude are required"
            } )
            return false

        }
        if(inputJson.location.hasOwnProperty('longitude') && String(inputJson.location.longitude).trim() !== '' ){
            longitude = Number(inputJson.location.longitude)
        }else{
            res.status( 500 ).json( {
                message:"longitude not be empty"
            } )
            return false

        }        
        if(inputJson.location.hasOwnProperty('latitude') && String(inputJson.location.latitude).trim() !== ''){
            latitude = Number(inputJson.location.latitude)
        }else{
            res.status( 500 ).json( {
                message:"latitude not be empty"
            } )
            return false

        }
        if(isValidCoordinates(longitude, latitude)){
            location['type'] = "Point"
            location['coordinates'] = [longitude, latitude]
            return true
        }else{
            res.status( 500 ).json( {
                message:"invalid location"
            } )
            return false
        }
    
 }
app.patch('/post/:postId', [auth, validateUser], (req,res)=> {
    var query = {}
    var inputJson = req.body
    if(inputJson.hasOwnProperty('active')){
        query['active'] = inputJson.active
    }
    if(inputJson.hasOwnProperty('title')){
        if(inputJson.title.trim() !== ''){
            query['title'] = inputJson.title
        }
    }
    if(inputJson.hasOwnProperty('body')){
        if(inputJson.body.trim() !== ''){
            query['body'] = inputJson.body
        }
    }
    
    if(inputJson.hasOwnProperty('location')){
        if(!validateLocation(location,inputJson, res)){
            return
        }
    }
    Post.updateOne( { _id:req.params.postId }, {
        $set: query
        } )
        .exec()
        .then( async result => {
            return res.status( 200 ).json( {
                post_id: req.params.postId
            } )
        } )
})

// delete post
app.delete('post/:postId', [auth, validateUser], (req,res)=> {
    Post.remove({_id: req.params.postId})
    .exec()
    .then(result=>{
        return res.status(200).json({
            message:"Post record deleted successfully."
        })
    }) 
 })

 // search by active/inactive
 /*
 body:{
     "active":true / false
 }
 */
app.post('/active',[auth], (req,res)=> {
    var query = {}
    if(req.body.hasOwnProperty('active')){
        query['active'] = req.body.active
    }
    query['created_by'] = req.userId
    Post.find(query)
    .select('title body location active')
    .exec()
    .then(postDetail=>{
        return res.status(200).json({
            posts:postDetail
        })
    })
 } )

 

 //  search by location 
 /*
 body: {
     "location":
            {
              "longitude":"-8.945406",
              "latitude":"38.575078"
            }
        }
 */
 // 15 miles / 3963.2  circular area
 app.post('/location',[auth], (req,res)=> {
    var location = {}
    if(!validateLocation(location, req.body, res)){
        return
    }
    var longitude = Number(req.body.location.longitude)
    var latitude = Number(req.body.location.latitude)
    const options = {
        location:{
            $geoWithin:{
                $centerSphere:[[longitude, latitude], 15/3963.2]
            }
        },
        created_by:req.userId
    }
    Post.find(options)
    .select('body title location active')
    .exec()
    .then(postDetail=>{
        return res.status(200).json({
            posts:postDetail
        })
    })
 } )

app.listen(3000);
