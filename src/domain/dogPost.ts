import mongoose from "mongoose";

export interface dogPost{
    user:mongoose.Types.ObjectId,
    image:string[],
    description:string,
    likes:mongoose.Types.ObjectId[],
    comments:string[],
    createdAt:Date,
}

export type postdetails ={
    id:string,
    description:string,
    image?:string[],
    likeCount?:number,
    commentCount?:number,
    likes?: string[];
    createdAt?: Date
    user?:{
        _id?:string;
        name:string;
        email:string;
        image:string
    }
}
