import mongoose from "mongoose";

export interface User{
    _id:string,
    name:string,
    email:string,
    phone:string,
    password:string,
    isBlocked:boolean,
    isAdmin:boolean,
    isGoogle:boolean,
    image:string,
    otp:number,
    wallet:number,
    followers:mongoose.Types.ObjectId[],
    following:mongoose.Types.ObjectId[],
}

 export type OtpDetails = Omit<User, '_id' | 'isBlocked' | 'isAdmin' | 'isGoogle'|'followers'|'following' | 'image'|'wallet'>;
 export type UserDetails = Pick<User, 'name' | 'email' | 'password' | 'phone'>;


 export type UserNotFollow = Pick<User,'_id'|'name'|'image'>