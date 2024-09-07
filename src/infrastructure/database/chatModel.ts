import mongoose,{Model,Document,Schema}from "mongoose";
import { Chat } from "../../domain/chat";

const chatSchema:Schema<Chat&Document> = new Schema({
    chatName:{
        type:String,
        trim:true
    },
    users:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ],
    latestMessage:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Message"
    }
   
},{
    timestamps:true
})

const chatModel:Model<Chat&Document> = mongoose.model("Chat",chatSchema)

export default chatModel;