import Otp from "../../domain/otp";
import { User } from "../../domain/user";
import { OtpDetails } from "../../domain/user";

interface UserRepo{
    findByEmail(email:string):Promise<User|null>
    saveOtp(data:OtpDetails):Promise<Otp>
    saveKennelOtp(data:OtpDetails):Promise<Otp>
    findOtpByEmail(email:string):Promise<Otp |null>
    findKennelOtpByEmail(email:string):Promise<Otp|null>
    deleteOtpByEmail(email:string):Promise<void>
    deleteKennelOtpByEmail(email:string):Promise<void>
    save(user:User):Promise<User>
    changePassword(email:string,password:string):Promise<boolean>
    getProfile(id:string):Promise<User|null>
    findById(id:string):Promise<User|null>
    updateProfile(id:string,data:User):Promise<User|null>

}


export default UserRepo