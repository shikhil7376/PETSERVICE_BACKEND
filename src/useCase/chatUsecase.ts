import ChatRepository from "../infrastructure/repository/chatRepository"

class ChatUseCase{
    private chatRepository
   constructor(chatRepository:ChatRepository){
      this.chatRepository = chatRepository
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

   async sendMessage(userId:string,content:string,chatId:string){
      const response = await this.chatRepository.sendMessage(userId,content,chatId)
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
}

export default ChatUseCase