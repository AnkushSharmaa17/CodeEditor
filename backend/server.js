import express from "express"
import {createServer, METHODS} from "http";
import { Server } from "socket.io"
import {YSocketIO} from "y-socket.io/dist/server"

const app = express();
app.use(express.static("public"))
const httpserver = createServer(app)

// i  this line meaning we setup y.js
const io = new Server(httpserver,{
    cors:{
        origin:"*",
       methods:["GET","POST"]
    }
})
const ySocketIO = new YSocketIO(io)
ySocketIO.initialize();

 app.get('/health',(req,res)=>{
    res.json({
        message:"ok",
        success:true
    })
 })


httpserver.listen(3000,()=>{
    console.log("running")
})