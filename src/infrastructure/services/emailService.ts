import nodemailer from 'nodemailer'
import Nodemailer from '../../useCase/interface/nodemailerInterface';
import 'dotenv/config'

class EmailService implements Nodemailer{
    private transporter:nodemailer.Transporter;
    constructor(){
      this.transporter = nodemailer.createTransport({
         service:"gmail",
         auth:{
            user:process.env.AUTH_EMAIL,
            pass:process.env.AUTH_PASS
         }
      })
    }
     sendOtp(email:string,otp:number):void{
        const mailOptions:nodemailer.SendMailOptions ={
            from:process.env.AUTH_EMAIL,
            to:email,
            subject:'Your OTP CODE',
            text:`Your OTP code is ${otp}`
        }
         this.transporter.sendMail(mailOptions,(err)=>{
            if(err){
                console.log(err);
            }else{
                console.log('verification code sent succesfully');
                
            }
        })
    }
}

export default EmailService