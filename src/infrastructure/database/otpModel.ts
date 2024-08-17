import mongoose,{Model,Document,Schema}  from "mongoose";
import Otp from "../../domain/otp";


const otpSchema:Schema = new Schema<Otp>({
    name:{
      type:String
    },
    email:{
      type:String,
      required:true
    },
    password:{
      type:String,
    },
    role:{
      type:String,
      enum:['user','kennelOwner'],
      required:true
    },
    phone:{
      type:String
    },
    otp:{
      type:Number,
      required:true
    },
    otpGeneratedAt:{
       type:Date,
       required:true
    },
   
})

const OtpModel:Model<Otp|Document> = mongoose.model<Otp&Document>("Otp",otpSchema)

export default OtpModel