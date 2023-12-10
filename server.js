var express = require('express');
// const { Mongoose } = require('mongoose');
var app = express();
const Weather = require('./models/weather')
const isWeatherAvailable = require('./middleware/isWeatherAvailable')

app.use(express.json())


const mongoose = require('mongoose'); 
mongoose.connect("mongodb://akchaudhary197:Ankit123@ac-f7atdfo-shard-00-00.oirkhou.mongodb.net:27017,ac-f7atdfo-shard-00-01.oirkhou.mongodb.net:27017,ac-f7atdfo-shard-00-02.oirkhou.mongodb.net:27017/Node-API?ssl=true&replicaSet=atlas-dk3454-shard-0&authSource=admin&retryWrites=true&w=majority"
 ,{
    useNewUrlParser:true
})




let request = require('request');

const rateLimit = require("express-rate-limit");
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 100, // 15 minutes
  max: 60
});


// 
// body: {
//     "city":"new delhi"
// }
app.get('/', apiLimiter,[isWeatherAvailable],(req,res)=>{
    let apiKey = "a5a1b1589c8a83b111e10181d7a5b134";
    let city = req.body.city;
    let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`
    request(url, function (err, response, output) {
        if(err){
            console.log('error: ', error);
        } 
        else {
            let weather = JSON.parse(output)
            if(weather.code == 200){
                const cityWeather = new Weather( {
                    _id: new mongoose.Types.ObjectId(),
                    city : city,
                    temperature:weather.main.temp
                } )
                cityWeather.save()
                let message = `It's ${weather.main.temp} degrees F in ${weather.name}!`;
                return res.status(200).json({
                    message: message
                })
            }
            else{
                return res.status(200).json({
                    message: weather.message
                })
            }
        }
    });
})

app.listen(3000);
