var express = require('express');
const { Mongoose } = require('mongoose');
var app = express();
const jwt = require('jsonwebtoken')
const auth = require('./middleware/auth')
const User = require('./models/users')
const Book = require('./models/books')
const bcrypt = require('bcrypt')
var validator = require("email-validator");

app.use(express.json())


const mongoose = require('mongoose'); 
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
                            name:req.body.name,
                            role:req.body.role || "Customer"
                        })
                        try{
                            const token = jwt.sign({_id:registerUser._id.toString()},"mynameisAnkitandthisisdummyproject")
                            registerUser.tokens = registerUser.tokens.concat({token:token})
                            await registerUser.save()
                        }catch(error){
                            res.send(error)
                        }
                        return res.status(200).json( {
                            user_id:registerUser._id
                        } )    
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
                const token = jwt.sign({_id:userData._id.toString()},"mynameisAnkitandthisisdummyproject",{ expiresIn: 2 * 60 })
                userData.tokens = userData.tokens.concat({token:token})
                // res.cookie("jwt",token,{
                //     expires:new Date(Date.now()+600000),
                //     httpOnly:true,
                // })
                return res.status(200).json({
                    message: {
                        token:token,
                        email:userData.email,
                        name:userData.name,
                        user_id: userData._id,
                        role:userData.role
                    }
                })
            }
            
        }catch(error){
            res.send(error)
        }
})

/* add a book
    if seller want to add new book the pass in body like:
    {
        "book_name":"Let us C"
    }
*/
app.post('/add/book',[auth], (req,res)=> {  
    var inputJson = req.body
    if(req.user_role != "Seller"){
        return res.status( 500 ).json( {
            message:"Permission Denied."
        } )
    }
    if(inputJson.hasOwnProperty('book_name')){
        if ( req.body.book_name.trim().length <= 0 ) {
            return res.status( 500 ).json( {
                message:"Book name not be empty string"
            } )
        }
        inputJson.book_name = String(inputJson.book_name).trim()
        Book.find({name:inputJson.book_name})
        .count()
        .then(bookCount=>{
            if(bookCount > 0){
                return res.status(500).json({
                    message:"Book already exist."
                })
            }else{
                const newBook = new Book( {
                    _id: new mongoose.Types.ObjectId(),
                    name : req.body.book_name,
                    purchased:'false'
                } )
                newBook.save()
                return res.status( 200 ).json( {
                    message: {
                        _id:newBook._id,
                    }
                } )
            }
        })
    }else{
        return res.status(500).json({
            message:"book_name field required."
        })
    }
 
 } )


 /* update book 
    if customer want to buy book then pass input in body like:
        
        {
            "purchased":true
        }

    if seller want to update book detail then pass input in body like:
    {
        "updated_book_name" : "updated name of book",
        "purchased" : true/false
    }
    add purchased field if you want to update book purchase field or not and same for updated_book_name
 */
app.patch('/update/book/:bookId',[auth], (req,res)=> {  
    var inputJson = req.body
    var query = {}
    Book.find({_id:req.params.bookId})
    .select('name')
    .exec()
    .then(bookDetails=>{
        if ( bookDetails.length <= 0 ){
            return res.status(500).json({
                message:"No record available."
            }) 
        }
        if( req.user_role == 'Seller') {
            if(inputJson.hasOwnProperty('updated_book_name')){
                if(bookDetails[0].name == inputJson.updated_book_name  ){
                    if(req.body.updated_book_name.trim().length<=0){
                        return res.status(500).json({
                            message:"book name field not be empty string"
                        })
                    }
                    return res.status(500).json({
                        message:"Book already exist, please use different name"
                    })
                }
                else{
                    query['name'] = inputJson.updated_book_name
                }
            }
        }
        if(req.user_role == 'Customer'){
            if(inputJson.hasOwnProperty('purchased') && !inputJson.purchased){
                return res.status(500).json({
                    message:"Not authorised for this activity."
                })
            }
        }
        if(inputJson.hasOwnProperty('purchased')){
            query['purchased'] = inputJson.purchased
        }
        Book.updateOne( { _id:req.params.bookId }, {
            $set: query
            } )
            .exec()
            .then( async result => {
                return res.status( 200 ).json( {
                    book_id: req.params.bookId
                } )
            } )
    })
})

// delete book
app.delete('/delete/book/:bookId',[auth], (req,res)=> {  
    Book.remove({_id: req.params.bookId})
    .exec()
    .then(result=>{
        return res.status(200).json({
            message:"Book record deleted successfully."
        })
    }) 
 })


/* get all books
   if customer login then it want to see purchased books:
   body:
    {
        purchased_book = true
    }

    if seller login then it want to see sold books:
   body:
    {
        sold_books = true
    }

    if anyone want to all books then no need to pass anything in body
*/
app.get('/',[auth], (req,res)=> {
    var inputJson = req.body
    var query = {}
    if(req.user_role === 'Customer'){
        if ( inputJson.hasOwnProperty('purchased_book') && inputJson.purchased_book ) {
             query['purchased'] = true
        }
    }
    if(req.user_role === 'Seller'){
        if ( inputJson.hasOwnProperty('sold_books') && inputJson.sold_books ) {
             query['purchased'] = true
        }
    }
    Book.find(query)
    .select(' name ')
    .exec()
    .then( allBooks => {
        if( allBooks.length > 0 ) {
            var bookArray = []
            for ( var i = 0; i < allBooks.length; i++ ) {
                bookArray.push( allBooks[i]['name'] )
            }
            return res.status(500).json({
                books : bookArray
            })
        }
    })

 } )


 /* search book by name
    body:
    {
        "book_name":"Let us C"
    }
 */

app.post('/search/book',[auth], (req,res)=> {
    var inputJson = req.body
    if( inputJson.hasOwnProperty('book_name') ) {
        if(String(inputJson.book_name).trim() == ''){
            return res.status(500).json({
                message : "Only white space not allowed."
            })
        }
        inputJson.book_name = String(inputJson.book_name).trim()
    }else{
        return res.status(500).json({
            message : "Book name field is required"
        })
    }
    Book.find({name:{$regex: new RegExp('^' + inputJson.book_name, 'i')}})
    .select(' name ')
    .exec()
    .then( allBooks => {
        if( allBooks.length > 0 ) {
            if(allBooks[0]['name'].toLowerCase() == inputJson.book_name.toLowerCase()){
                return res.status(200).json({
                    books : allBooks[0]['name']
                })
            }else{
                return res.status(500).json({
                    message : "No record found."
                })
            }
        }else{
            return res.status(500).json({
                message : "No record found."
            })
        }
    })

 } )

app.listen(3000);
