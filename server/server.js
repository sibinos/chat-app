require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http= require("http") ;
const { connectDB } = require("./lib/db.js");
const { userRouter } = require("./routes/userRoutes.js");
const { MessageRouter } = require("./routes/messageRoutes.js");
const { Server } = require("socket.io");
const { Socket } = require("dgram");


// create server using http
const app = express();
const server = http.createServer(app)

// initailize socket.io server
const io= new Server(server,{cors:{origin:"*"}})

app.set('io', io);  // Store io instance
let userSocketMap={};
app.set('userSocketMap', userSocketMap);
// store online user
 //{userId:socketId}
// socket io connection Handler
io.on('connection',(socket)=>{
    const userId=socket.handshake.query.userId;
    console.log('user connected',userId);
    const userSocketMap = app.get('userSocketMap');
    if(userId) userSocketMap[userId]=socket.id;

    // emit online users to all connected clients
    io.emit("getOnlineUsers",Object.keys(userSocketMap));

    socket.on("disconnect",()=>{
        console.log('user disconnected',userId)
        delete userSocketMap[userId];
        io.emit("getOnlineUsers",Object.keys(userSocketMap))
    })
})


module.exports={io,userSocketMap};

//middle ware
app.use(express.json({limit:'4mb'}));
app.use(cors());

app.use("/api/server",(req,res)=>res.send('server is live'));
app.use("/api/auth",userRouter)
app.use("/api/messages",MessageRouter)

const PORT = process.env.PORT || 5000; 

const startServer= async ()=>{
    try{
        await connectDB();
        if(process.env.NODE_ENV !=="production"){
            server.listen(PORT,()=>{console.log('auto restart live server working on port : '+PORT)});
        }
        
    }catch (error){
        console.log('Startup erorr',error);
    }
}

startServer()

module.exports=server;
