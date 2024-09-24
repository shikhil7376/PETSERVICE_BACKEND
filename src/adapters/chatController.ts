import { sendMessage } from "../domain/message"
import ChatUseCase from "../useCase/chatUsecase"
import { Request,Response,NextFunction, response } from "express"

class ChatController{
    private chatUsecase
   constructor(chatUseCase:ChatUseCase){
     this.chatUsecase = chatUseCase
   }

   async accessChat(req:Request,res:Response,next:NextFunction){
     try {
        const {currentId,userId} = req.body  
        const response = await this.chatUsecase.accessChat(currentId,userId)
         return res.status(response.status).json(response.data)
     } catch (error) {
        next(error)
     }
   }

   async fetchChat(req:Request,res:Response,next:NextFunction){
    try {
        
        const {currentId} = req.body
        const response = await this.chatUsecase.fetchChat(currentId)
        
        return res.status(response.status).json(response.data)
    } catch (error) {
        next(error)
    }
   }

async sendMessage(req:Request,res:Response,next:NextFunction){
    try {
        const {content,senderId,chatId} = req.body
       let file = req.file
      let mediaType = null
      let mediaUrl = null       
     if(file){
        const fileType = file.mimetype.split('/')[0]
        mediaType = fileType
        mediaUrl = file.path
     }
     
     const data={
        content,
        senderId,
        chatId,
        mediaType,
        mediaUrl
     }
     const response = await this.chatUsecase.sendMessage(data as sendMessage)
     return res.status(response.status).json(response.data.data)
    } catch (error) {
        next(error)
    }
}

async allMessage(req:Request,res:Response,next:NextFunction){
  try {
     const {chatId} = req.body
      const response = await this.chatUsecase.allMessage(chatId)
      return res.status(response.status).json(response.data)
  } catch (error) {
     next(error)
  }
}

async deleteMessage(req:Request,res:Response,next:NextFunction){
  try {
     const {msgId} = req.body
     const response = await this.chatUsecase.deleteMessage(msgId)
     return res.status(response.status).json(response.data)
  } catch (error) {
    next(error)
  }
}
  
}

export default ChatController