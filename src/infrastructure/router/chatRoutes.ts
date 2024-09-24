import express from 'express'
import ChatController from '../../adapters/chatController'
import ChatRepository from '../repository/chatRepository'
import ChatUseCase from '../../useCase/chatUsecase'
import upload from '../services/multer'
import Cloudinary from '../services/cloudinary'


//services
const cloudinary = new Cloudinary()

// repositories
const chatrespository = new ChatRepository()

// usecase
 const chatusecase = new ChatUseCase(chatrespository,cloudinary)

 // controllers

 const chatController = new ChatController(chatusecase)

const route = express.Router()
 
 route.post('/accessChat',(req,res,next)=>chatController.accessChat(req,res,next))
 route.post('/fetchChat',(req,res,next)=>chatController.fetchChat(req,res,next))
 route.post('/sendMessage',upload.single('file'),(req,res,next)=>chatController.sendMessage(req,res,next))
 route.post('/getmessage',(req,res,next)=>chatController.allMessage(req,res,next))
 route.post('/delete-message',(req,res,next)=>chatController.deleteMessage(req,res,next))





export default route