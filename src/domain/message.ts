import mongoose from "mongoose";

export interface Message {
    sender: mongoose.Schema.Types.ObjectId;
    content?: string;
    chat: mongoose.Schema.Types.ObjectId;
    image?:string;
    audio?:string;
    video?:string;
  } 

  export type sendMessage={
    content?:string,
    senderId?:string,
    chatId?:string,
    mediaType?:string,
    mediaUrl?:string
 }