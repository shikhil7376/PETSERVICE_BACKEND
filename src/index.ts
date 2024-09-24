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

      let onlineUsers: Record<string, string> = {};
      io.on("connection",(socket)=>{ 
       socket.on('setup',(userData)=>{
           socket.join(userData._id)
           onlineUsers[socket.id] = userData._id; 
           io.emit("userOnline", onlineUsers);
           socket.emit("connected")
       })

       socket.on('joinchat',(room)=>{                
          socket.join(room)
       })

       socket.on('newmessage',(newMessageRecieved)=>{
        
        var chat = newMessageRecieved.chat;       

           if(!chat.users) return console.log('chat.users not defined');

           chat.users.forEach((user:any) => {
            if (user._id == newMessageRecieved.sender._id) return 
  
            socket.in(user._id).emit("messagerecieved", newMessageRecieved);
          });
           
       })

       socket.on('deleteMessage',({ messageId,activeChat})=>{        
            activeChat.forEach((user:any)=>{
              io.in(user._id).emit('messageDeleted',messageId)
            })
             
       })

       socket.on('videocallInitiated',({roomId,fromUser,toUser,chatId,fromUserName})=>{        
        socket.in(toUser).emit('videoCallNotify',roomId,fromUserName)
       })

       socket.on("disconnect", () => {
        // for (const userId in onlineUsers) {
        //   if (onlineUsers[userId] === socket.id) {
        //     delete onlineUsers[userId]; // Remove from the online users list
    
        //     // Notify other users that this user is offline
        //     io.emit("userOffline", userId);
        //     break;
          // }
        // }

        delete onlineUsers[socket.id]; // Remove user from the online list
        io.emit('userOnline', onlineUsers);
      });

      })

      
}



startServer()