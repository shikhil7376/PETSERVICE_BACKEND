 import express from 'express'
import KennelRepository from "../repository/Kennel/kennelRepository"
import KennelUseCase from "../../useCase/Kennel/kennelUsecase"
import kennelController from "../../adapters/kennelController"
import GenerateOtp from '../services/generateOtp'
import EncryptPassword from '../services/bcryptPassword'
import UserRepository from '../repository/userRepository'
import EmailService from '../services/emailService'
import JWTTOKEN from '../services/generateToken'
import VerifiedkennelRepository from '../repository/Kennel/verifiedKennelRepository'
import { kennelAuth } from '../middleware/kennelAuth'
import Cloudinary from '../services/cloudinary'
import upload from '../services/multer'

// services
const generateOtp = new GenerateOtp()
const encryptPassword = new EncryptPassword()
const generateEmail = new EmailService()
const jwtToken = new JWTTOKEN()
const cloudinary = new Cloudinary()


// repositories
const kennelRepository = new KennelRepository()
const userRepository = new UserRepository()
const verifiedkennelRepository = new VerifiedkennelRepository()

//usecases
const kennelUsecase = new KennelUseCase(kennelRepository,generateOtp,encryptPassword,userRepository,generateEmail,jwtToken,verifiedkennelRepository,cloudinary)

// controllers
const kennelcontroller = new kennelController(kennelUsecase)

const route = express.Router()

route.post('/sign_up',(req,res,next)=>kennelcontroller.signUp(req,res,next))
route.post('/verify',(req,res,next)=>kennelcontroller.verifyOtp(req,res,next))
route.post('/login',(req,res,next)=>kennelcontroller.login(req,res,next))
route.post('/resendotp',(req,res,next)=>kennelcontroller.resendOtp(req,res,next))
route.post('/getprofile',kennelAuth,(req,res,next)=>kennelcontroller.getProfile(req,res,next))
route.post('/add-cages',upload.array('cageimages',3), (req, res, next) => kennelcontroller.addKennel(req, res, next));
route.get('/get-cages',(req,res,next)=>kennelcontroller.getCages(req,res,next))
route.post('/view-details',(req,res,next)=>kennelcontroller.viewDetails(req,res,next))
route.post('/booking',(req,res,next)=>kennelcontroller.booking(req,res,next))
route.post('/owners-cage',(req,res,next)=>kennelcontroller.getOwnersCage(req,res,next))
route.post('/edit-cage',upload.array('editimages',3),(req,res,next)=>   kennelcontroller.editCage(req,res,next))
route.post('/edit-profile',upload.single('ownerimage'),(req,res,next)=> kennelcontroller.editProfile(req,res,next))
route.post('/get-bookings',(req,res,next)=>kennelcontroller.getBookings(req,res,next))
route.post('/cancel-booking',(req,res,next)=>kennelcontroller.cancelBooking(req,res,next))
export default route 