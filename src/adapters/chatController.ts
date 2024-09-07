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
        const {userId,content,chatId} = req.body
        const response = await this.chatUsecase.sendMessage(userId,content,chatId)
        return res.status(response.status).json(response.data)
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
  
}

export default ChatController