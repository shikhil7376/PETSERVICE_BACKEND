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
    otp?:number,
    wallet:number,
    followers:mongoose.Types.ObjectId[],
    following:mongoose.Types.ObjectId[], 
}

export interface Post {
    id: string;                 // Post ID
    images: string[];            // Array of image URLs
    description: string;         // Post description
    likeCount: number;           // Count of likes on the post
    commentCount: number;        // Count of comments on the post
    likes: string[];             // Array of user IDs who liked the post
    user: {
      userid: string;            // User ID who created the post
      name: string;              // User's name
      email: string;             // User's email
      image: string;             // User's profile image
      followers: string[];       // Array of user IDs who follow this user
    };
  }
  
 export type OtpDetails = Omit<User, '_id' | 'isBlocked' | 'isAdmin' | 'isGoogle'|'followers'|'following' | 'image'|'wallet'>;
 export type UserDetails = Pick<User, 'name' | 'email' | 'password' | 'phone'>;


 export type UserNotFollow = Pick<User,'_id'|'name'|'image'>