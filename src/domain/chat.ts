import mongoose from "mongoose";


export interface Chat{
    chatName:String,
    users:mongoose.Types.ObjectId,
    latestMessage:mongoose.Types.ObjectId
}