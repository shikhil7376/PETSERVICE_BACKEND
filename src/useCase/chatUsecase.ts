import { sendMessage } from "../domain/message"
import ChatRepository from "../infrastructure/repository/chatRepository"
import Cloudinary from "../infrastructure/services/cloudinary";

class ChatUseCase{
    private chatRepository
    private Cloudinary;
   constructor(chatRepository:ChatRepository,cloudinary: Cloudinary){
      this.chatRepository = chatRepository
      this.Cloudinary = cloudinary;

   }

   async accessChat(currentId:string,userId:string){
      const response = await this.chatRepository.accessChat(currentId,userId)      
      if(response){
        return{
            status:200,
            data:{
                data:response,
                message:"succesfull"
            }
        }
      }else{
           return{
            status:200,
            data:{
                message:"failed"
            }
           }
      }
   }

   async fetchChat(currentId:string){
     const response = await this.chatRepository.fetchChat(currentId)
     
     if(response){
        return{
            status:200,
            data:{
                data:response,
                message:"succesfull"
            }
        }
     }else{
        return{
            status:400,
            data:{
                message:"failed"
            }
        }
     }
   }

   async sendMessage(data:sendMessage){
    if(data.mediaType == 'image'){
        let newImagePath = await this.Cloudinary.uploadImage(data.mediaUrl, "chatimage");
        data.mediaUrl = newImagePath
    }
    if(data.mediaType == 'video'){  
        let vdoPath = await this.Cloudinary.uploadVideo(data.mediaUrl,"chatvideo")        
        data.mediaUrl = vdoPath        
    }

    if(data.mediaType =='audio'){   
        const audioUrl = await this.Cloudinary.uploadAudio(data.mediaUrl, 'chat-audio-files');
        console.log('audioUrl',audioUrl);
        
        data.mediaUrl = audioUrl

    }
      const response = await this.chatRepository.sendMessage(data)
      if(response){
        return{
            status:200,
            data:{
                data:response,
                message:"succesfull"
            }
        }
      }else{
         return {
            status:400,
            data:{
                message:"failed"
            }
         }
      }
   }
   async allMessage(chatId:string){
    const response = await this.chatRepository.allMessage(chatId)
    if(response){
        return{
            status:200,
            data:response,
            message:"success"
        }
    }else{
       return{
        status:400,
        message:"failed"
       }
    }
   }

   async deleteMessage(msgId:string){
     const response = await this.chatRepository.deleteMessage(msgId)
    if(response){
        return{
            status:200,
            data:{
                data:response,
                message:'message deleted succesfully'
            }
        }
    }else{
        return{
            status:400,
            data:{
                message:'failed to delete message'
            }
        }
    }
     
   }
}

export default ChatUseCase