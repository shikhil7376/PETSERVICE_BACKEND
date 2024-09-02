import express from 'express'
import AdminController from '../../adapters/adminController'
import AdminUseCase from '../../useCase/adminUsecase'
import AdminRepository from '../repository/adminRepository'
import VerifiedkennelRepository from '../repository/Kennel/verifiedKennelRepository'
import { adminAuth } from '../middleware/adminAuth'

// repository
 const adminRepository = new AdminRepository()
 const verifiedKennelRepository = new VerifiedkennelRepository() 

// usecases
 const adminUsecase = new AdminUseCase(adminRepository,verifiedKennelRepository)


// adminController
const adminController = new AdminController(adminUsecase)

const route = express.Router()

route.get('/users',(req,res,next)=>adminController.getUser(req,res,next))
route.post('/blockUser',(req,res,next)=>adminController.blockUser(req,res,next))
route.post('/unBlockUser',(req,res,next)=>adminController.UnBlockUser(req,res,next))
route.get('/getRequests',(req,res,next)=>adminController.getKennelRequests(req,res,next))
route.post('/approveRequests',(req,res,next)=>adminController.approveKennel(req,res,next))
route.post('/rejectRequests',(req,res,next)=>adminController.rejectKennel(req,res,next))
route.get('/getVerifiedkennelOwner',(req,res,next)=>adminController.getVerifiedKennelOwner(req,res,next))
route.post('/blockkennelowner',(req,res,next)=>adminController.blockkennelOwner(req,res,next))
route.post('/unblockkennelowner',(req,res,next)=>adminController.unblockkennelOwner(req,res,next))
route.get('/Dashboard',(req,res,next)=>adminController.getDashboard(req,res,next))
export default route