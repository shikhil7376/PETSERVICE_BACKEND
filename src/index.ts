import { httpServer } from "./infrastructure/config/app";
import { connectDB } from "./infrastructure/config/connectDB";
import { Server as SocketIOServer } from 'socket.io';



const PORT = process.env.PORT || 3000

const startServer = async():Promise<void>=>{
    await connectDB()
    const app = httpServer;
    const server = httpServer.listen(PORT, () => {
        console.log(`Server is running on https://127.0.0.1:${PORT}`);
      });

    const io = new SocketIOServer(server, {
        pingTimeout:60000,
         cors:{
           origin:process.env.CORS
         }
      });

      io.on("connection",(socket)=>{
        // console.log('connected to socket.io');
        
       socket.on('setup',(userData)=>{
           socket.join(userData._id)
        //    console.log(userData._id);
           
           socket.emit("connected")
       })

       socket.on('joinchat',(room)=>{
          socket.join(room)
        //   console.log('user joined room',room);  
       })

       socket.on('newmessage',(newMessageRecieved)=>{
        // console.log('checksocket',newMessageRecieved);
        
        var chat = newMessageRecieved.chat;
        //  console.log('chatty',chat);
         
           
           if(!chat.users) return console.log('chat.users not defined');

           chat.users.forEach((user:any) => {
            if (user._id == newMessageRecieved.sender._id) return 
  
            socket.in(user._id).emit("messagerecieved", newMessageRecieved);
          });
           
       })

      })

      
}



startServer()