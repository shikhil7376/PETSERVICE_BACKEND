import Otp from "../../domain/otp";
import { User } from "../../domain/user";
import { OtpDetails } from "../../domain/user";
import { dogPost, postdetails } from "../../domain/dogPost";
import { commentDetails } from "../../domain/Comment";
import { getComments } from "../../domain/Comment";
import { UserNotFollow } from "../../domain/user";
import { Post } from "../../domain/user";


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
    getUserPost(id:string):Promise<Post[]|null>
    findById(id:string):Promise<User|null>
    updateProfile(id:string,data:User):Promise<User|null>
    addPost(data:postdetails):Promise<boolean>
    getAllPost():Promise<postdetails[]>
    likePost(userId:string,postId:string):Promise<boolean>
    commentPost(data:commentDetails):Promise<boolean>
    getAllComments(postId:string):Promise<getComments[]>
    follow(userId:string,targetId:string):Promise<boolean>
    userNotFollow(userId:string):Promise<UserNotFollow[]>
    allUsers(userId:string,keyword:string):Promise<User[]|[]>
    getPostById(id:string):Promise<dogPost|null>
    updatePost(postId:string,updatedPost:dogPost):Promise<void>
    getPostDetailsById(postId:string):Promise<Post|null>
    deletePost(postId:string):Promise<boolean>
    getFollowers(userId:string):Promise<User[]|[]>
    getFollowing(userId:string):Promise<User[]|[]>
}


export default UserRepo