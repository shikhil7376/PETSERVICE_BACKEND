import express from 'express'
import ChatController from '../../adapters/chatController'
import ChatRepository from '../repository/chatRepository'
import ChatUseCase from '../../useCase/chatUsecase'



// repositories
const chatrespository = new ChatRepository()

// usecase
 const chatusecase = new ChatUseCase(chatrespository)

 // controllers

 const chatController = new ChatController(chatusecase)

const route = express.Router()
 
 route.post('/accessChat',(req,res,next)=>chatController.accessChat(req,res,next))
 route.post('/fetchChat',(req,res,next)=>chatController.fetchChat(req,res,next))
 route.post('/sendMessage',(req,res,next)=>chatController.sendMessage(req,res,next))
 route.post('/getmessage',(req,res,next)=>chatController.allMessage(req,res,next))





export default route