import KennelRepository from "../../infrastructure/repository/Kennel/kennelRepository"
import GenerateOtp from "../../infrastructure/services/generateOtp"
import EncryptPassword from "../../infrastructure/services/bcryptPassword"
import UserRepository from "../../infrastructure/repository/userRepository"
import EmailService from "../../infrastructure/services/emailService"
import JWTTOKEN from "../../infrastructure/services/generateToken"
import VerifiedkennelRepository from "../../infrastructure/repository/Kennel/verifiedKennelRepository"
import Cloudinary from "../../infrastructure/services/cloudinary"
import Stripe from "stripe"


class KennelUseCase{
    private KennelRepository
    private GenerateOtp
    private EncryptPassword
    private UserRepository
    private generateEmail
    private JwtToken
    private verifiedkennelRepository
    private Cloudinary

    constructor(
        KennalRepository:KennelRepository,
        GenerateOtp:GenerateOtp,
        EncryptPassword:EncryptPassword,
        UserRepository:UserRepository,
        generateEmail:EmailService,
        JwtToken:JWTTOKEN,
        verfiedKennelRepository:VerifiedkennelRepository,
        cloudinary:Cloudinary,
    ){
     this.KennelRepository = KennalRepository
     this.GenerateOtp = GenerateOtp
     this.EncryptPassword = EncryptPassword
     this.UserRepository = UserRepository
     this.generateEmail = generateEmail
     this.JwtToken = JwtToken
     this.verifiedkennelRepository =  verfiedKennelRepository
     this.Cloudinary = cloudinary
 
    }
  


    async checkExists(email:string){
     
        const kennelOwnerExists = await this.KennelRepository.findByEmail(email)
        if(kennelOwnerExists){
            return{
                status:400,
                data:{
                    status:false,
                    message:'kennel owner already exists'
                }
            }
        }else{
          return{
            status:200,
            data:{
                status:true,
                message:'kennel owner does not exists'
            }
          }

        }
    }

    async signup(name:string,email:string,password:string,phone:string){
        const otp = this.GenerateOtp.createOtp()
        const hashedPassword = await this.EncryptPassword.encryptPassword(password)
        await this.UserRepository.saveKennelOtp(name,email,hashedPassword,phone,otp)
        this.generateEmail.sendOtp(email,otp)

        return {
            status:200,
            data:{
               status:true,
               message:'verification otp sent to your email'
            }
        }
    }

   async verifyOtp(email:string,otp:number){
      const otpRecord = await this.UserRepository.findKennelOtpByEmail(email)
      let data:{name:string;email:string;phone:string;password:string} =
      {
        name:otpRecord.name,
        email:otpRecord.email,
        phone:otpRecord.phone,
        password:otpRecord.password
      } 
      if(!otpRecord){
        return {status:400, message:'Invalid or expired OTP'}
      }
     const now = new Date().getTime()
     const otpGeneratedAt = new Date(otpRecord.otpGeneratedAt).getTime()
     const otpExpiration = 2 * 60 * 1000; 
     console.log(`Now: ${now}, OTP Generated At: ${otpGeneratedAt}, Difference: ${now - otpGeneratedAt}`);

     if(now - otpGeneratedAt > otpExpiration){
        await this.UserRepository.deleteKennelOtpByEmail(email)
        return {status:400,message:'OTP has expired'}
     }
     if(otpRecord.otp!==otp){
        return {status:400,message:'Invalid OTP'}
     }
     await this.UserRepository.deleteKennelOtpByEmail(email)
     return {status:200,message:'OTP verified successfully',data:data}
   } 

   async verifyKennelOwner(kennelOwner:any){
      const newKennelOwner = {...kennelOwner}
      const kennelOwnerData = await this.KennelRepository.save(newKennelOwner)
      let data={
          _id:kennelOwnerData._id,
          name:kennelOwnerData.name,
          email:kennelOwnerData.email,
          isApproved:kennelOwnerData.isApproved,
          isBlocked:kennelOwnerData.isBlocked,
    }
    const token = this.JwtToken.generateToken(kennelOwnerData._id,'kennelOwner')
    return {
        status:200,
        data:data,
        message:'OTP verified succesfully',
        token
    }
   }

   async login(email:string,password:string){
     const kennelOwner = await this.verifiedkennelRepository.findByEmail(email)
      if(kennelOwner){
        let data = {
            _id:kennelOwner._id,
            name:kennelOwner.name,
            email:kennelOwner.email,
            phone:kennelOwner.phone
        }
        if(kennelOwner.isBlocked){
            return{
                status:400,
                data:{
                    status:false,
                    message:'you have been blocked by admin',
                    token:''
                }
            }
        }
        const passworMatch = await this.EncryptPassword.compare(password,kennelOwner.password)
        if(passworMatch){
            let token = this.JwtToken.generateToken(kennelOwner._id,'verifiedkennelowner')
            return {
                status:200,
                data:{
                    status:true,
                    message:data,
                    token
                }
            }
        }else{
            return {
                status:400,
                data:{
                    status:false,
                    message:'invalid email or password',
                    token:''
                }
            }
        }
      }else{
        return{
            status:400,
            data:{
                status:false,
                message:'invalid email or password',
                token:''
            }
        }
      }
   }

   async resendOtp (name:string,email:string,password:string,phone:string){
    const otp = this.GenerateOtp.createOtp()
    const hashedPassword = await this.EncryptPassword.encryptPassword(password)
    await this.UserRepository.saveKennelOtp(name,email,hashedPassword,phone,otp)
    this.generateEmail.sendOtp(email,otp)
    return {
        status:200,
        data:{
            status:true,
            message:'verification otp has been sent to the email'
        }
    }
}

async getProfile(id:string){
 const profileData = await this.verifiedkennelRepository.getProfile(id)
 let data = {
    _id:profileData?._id,
    name:profileData?.name,
    email:profileData?.email,
    phone:profileData?.phone,
    isBlocked:profileData?.isBlocked,
    image:profileData?.image
}
if(profileData){
    return {
        status:200,
        data:{
            status:true,
            message:data
        }
    }
}else{
    return{
        status:400,
        message:'failed to get data'
    }
}
}

async addCage(data:any,filepath:string[]){
    const imageUrls = await this.Cloudinary.uploadMultipleimages(filepath,'cages')
     data.image = imageUrls
     const savedKennel = await this.verifiedkennelRepository.savecage(data)
     if(savedKennel){
        return {
            status:200,
            message:'cage added successfully'
        }
     }else{
        return{
            status:400,
            message:'failed to add cage'
        }
     }
}

 async getCages(){
    const cagedata = await this.verifiedkennelRepository.getCages()
     if(cagedata){
        return{
            status:200,
            data:{
                status:true,
                data:cagedata
            }
        }
     }else{
        return{
            status:400,
            message:'failed to fetch data'
        }
     }
 }

 async getSingleCage(id:string){
    const viewdetails = await this.verifiedkennelRepository.getSingleCage(id)
    let data ={
        _id:viewdetails?._id,
        kennelname:viewdetails?.kennelname,
        location:viewdetails?.location,
        maxcount:viewdetails?.maxcount,
        phone:viewdetails?.phone,
        pricepernight:viewdetails?.pricepernight,
        image:viewdetails?.image,
        type:viewdetails?.type,
        description:viewdetails?.description,
        ownerId:viewdetails?.ownerId
    }
    if(viewdetails){
        return {
            status:200,
            data:{
                status:true,
                message:data
            }
        }
    }else{
        return{
            status:400,
            message:'failed to get data'
        }
    }
 }

 async booking(details:any,userid:string,fromdate:string,todate:string,totalAmount:number,totalDays:Number){
      let amount:number = totalAmount
      const stripeKey = process.env.STRIPE_KEY;
      if (!stripeKey) {
          throw new Error('Stripe key is not defined');
      }
      const stripe = new Stripe(stripeKey);
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Premium Subscription",
              },
              unit_amount: amount * 100,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `http://localhost:5173/orders`,
        cancel_url: "http://localhost:5173/company",
        // customer_email: email,
         billing_address_collection: "auto"
      });

      
      

    const bookinginfo = await this.verifiedkennelRepository.savebooking(details,userid,fromdate,todate,totalAmount,totalDays)
    if(bookinginfo){
        return {
            status:200,
            message:session.id
        }
    }
  
 }

 async getOwnersCage(Id:string,page:number,limit:number,searchTerm:string){
    const data = await this.verifiedkennelRepository.getownerscages(Id,page,limit,searchTerm)
    if(data){
        return {
            status:200,
             data:data.cage,
             total:data.total,
             page,
             limit
        }
    }else{
        return{
            status:400,
            message:'failed to fetch data'
        }
    }
    
 }

 async getCageById(Id:string){
    const cage = await this.verifiedkennelRepository.getCageById(Id)
    if(cage){
        return{
            status:200,
            data:{
                status:true,
                data:cage
            }
        }
    }else{
        return{
            status:400,
            message:'cage not found'
        }
    }
 }
 
 async editCage(id:string,data:any,filepath:string[],existingImages:string[]){
       let finalImages = existingImages
         if(filepath.length>0){
            const newImagePaths = await this.Cloudinary.uploadMultipleimages(filepath, 'cages');
            finalImages = newImagePaths;
         }
         data.image = finalImages;
      const updatedCage = await this.verifiedkennelRepository.updatecage(id,data)
      if(updatedCage){
        return{
            status:200,
            message:'cage updated successfully'
        }
      }else{
        return{
            status:400,
            message:'failed to update cage'
        }
      }
 }

 async findById(Id:string){
    const owner = await this.verifiedkennelRepository.findById(Id)
    if(owner){
        return {
            data:owner
        }
    }else{
        return{
            status:400,
            message:'owner not found'
        }
    }
 }

 async editProfile(id:string,data:any,filePath:string){
      let finalImage
    if(filePath){
        const newImagePath = await this.Cloudinary.uploadImage(filePath,'kennelowner')
       finalImage = newImagePath
    }
    data.image = finalImage
    const updateOwner = await this.verifiedkennelRepository.updateProfile(id,data)
    if(updateOwner){
        return{
            status:200,
            message:'profile updated succesfully'
        }
    }else{
        return{
            status:400,
            message:'failed to update profile'
        }
    }
 }

 async getbookings(id:string){
   const bookings = await this.verifiedkennelRepository.getbookings(id)
    if(bookings){
        return{
            status:200,
            data:{
                status:true,
                data:bookings
            }
        }
    }else{
        return{
            status:400,
            message:'failed to fetch data'
        }
    }
 }

 async cancelBooking(bookingid:string,cageid:string){
    const cancelBooking = await this.verifiedkennelRepository.cancelBooking(bookingid,cageid)
    if(cancelBooking){
        return{
            status:200,
            message:'booking cancelled successfully'
        }
    }else{
        return{
            status:400,
            message:'failed to cancel booking'
        }
    }
 }

}

export default KennelUseCase 