const http = require('http');
const app = require('./app'); 
const server = http.createServer((req,res)=>{
    if(req.url == '/') {
        res.write("Hello");
        res.end()
    }

    if(req.url == '/api/cousres') {
        res.write("Hello  worlds");
        res.end()
    }
    

});





server.listen(3000);
console.log("Listening....")
