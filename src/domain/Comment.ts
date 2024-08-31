import mongoose from "mongoose";


export interface Comment{
    user:mongoose.Types.ObjectId,
    post:mongoose.Types.ObjectId,
    text:string,
    createdAt:Date
}

export interface commentDetails{
    userId:string,
    postId:string,
    comment:string
}

export interface getComments{
    _id:string,
    text:string,
    createdAt:Date,
    user:{
        name:string,
        email:string,
        image:string
    }
}