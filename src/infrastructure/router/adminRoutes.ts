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

route.get('/users',adminAuth ,(req,res,next)=>adminController.getUser(req,res,next))
route.post('/blockUser',adminAuth ,(req,res,next)=>adminController.blockUser(req,res,next))
route.post('/unBlockUser',adminAuth ,(req,res,next)=>adminController.UnBlockUser(req,res,next))
route.get('/getRequests',adminAuth ,(req,res,next)=>adminController.getKennelRequests(req,res,next))
route.post('/approveRequests',adminAuth ,(req,res,next)=>adminController.approveKennel(req,res,next))
route.post('/rejectRequests',adminAuth ,(req,res,next)=>adminController.rejectKennel(req,res,next))
route.get('/getVerifiedkennelOwner',adminAuth ,(req,res,next)=>adminController.getVerifiedKennelOwner(req,res,next))
route.post('/blockkennelowner',adminAuth ,(req,res,next)=>adminController.blockkennelOwner(req,res,next))
route.post('/unblockkennelowner',adminAuth ,(req,res,next)=>adminController.unblockkennelOwner(req,res,next))
route.get('/Dashboard',adminAuth ,(req,res,next)=>adminController.getDashboard(req,res,next))
route.get('/get-reports',adminAuth ,(req,res,next)=>adminController.getReports(req,res,next))
route.post('/blockPost',adminAuth ,(req,res,next)=>adminController.blockPost(req,res,next))
route.post('/unblockPost',adminAuth ,(req,res,next)=>adminController.unblockPost(req,res,next))
export default route 