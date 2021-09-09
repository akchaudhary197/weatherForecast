var express = require('express');
// const { Mongoose } = require('mongoose');
var app = express();
// const jwt = require('jsonwebtoken')
// const auth = require('./middleware/auth')
// const User = require('./models/users')
// const Book = require('./models/books')
const Task = require('./models/task')

// const bcrypt = require('bcrypt')
// var validator = require("email-validator");

app.use(express.json())


const mongoose = require('mongoose'); 
mongoose.connect("mongodb+srv://dummy:Ankit@123@cluster0.85bmm.mongodb.net/dummy?retryWrites=true&w=majority",{
    useNewUrlParser:true
})

/*
body:{
    "task_name":"abcdeas",
    "completed":true/false         // not necessary
}
*/
app.post('/add/task', (req,res)=> {  
    const task = new Task( {
        _id: new mongoose.Types.ObjectId(),
        name : req.body.task_name,
        completed:req.body.completed || 'false'
    } )
    task.save()
    return res.status( 200 ).json( {
        message: {
            _id:task._id,
        }
    } )
 } )

app.patch('/markAsComplete/:taskId', (req,res)=> {
    var query = {} 
    query['completed'] = true
    Task.updateOne( { _id:req.params.taskId }, {
        $set: query
        } )
        .exec()
        .then( async result => {
            return res.status( 200 ).json( {
                task_id: req.params.taskId
            } )
        } )
})

// delete task
app.delete('/:taskId', (req,res)=> {  
    Task.remove({_id: req.params.taskId})
    .exec()
    .then(result=>{
        return res.status(200).json({
            message:"Task record deleted successfully."
        })
    }) 
 })

 /*
 for completed task filter
 body: {
     "filter" :"completed"
 }

 for remaining task filter
 body: {
     "filter" :"remaining"
 }

 for all task filter
 body: {}
 */
app.post('/', (req,res)=> {
    var query = {}
    if(req.body.hasOwnProperty('filter')){
        if(req.body.filter == 'completed'){
            query['completed'] = true
        }
        if(req.body.filter == 'remaining'){
            query['completed'] = false
        }
    }
        Task.find(query)
        .select('name')
        .exec()
        .then(taskDetail=>{
            var taskDoc = []
            for(var i =0 ; i < taskDetail.length;i++){
                taskDoc.push(taskDetail[i].name)
            }
            return res.status(200).json({
                tasks:taskDoc
            })

        })
 } )

app.listen(3000);
