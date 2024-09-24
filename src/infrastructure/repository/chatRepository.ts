import { chatRepo } from "../../useCase/interface/chatRepo";
import chatModel from "../database/chatModel";
import UserModel from "../database/userModel";
import messageModel from "../database/messageModel";
import { Message, sendMessage } from "../../domain/message";
import mongoose from "mongoose";


class ChatRepository implements chatRepo {

    async  accessChat(currentId: string, userId: string): Promise<any> {
        try {
            if (!userId) {
                return null;
            }
       
            let isChat = await chatModel.findOne({
                $and: [
                    { users: { $elemMatch: { $eq: currentId } } },
                    { users: { $elemMatch: { $eq: userId } } }
                ]
            }).populate("users", "-password").populate("latestMessage");

            if (isChat) {
                await isChat.populate({
                    path: "latestMessage.sender",
                    select: "name image email"
                });
                return isChat; 
            }
            
            const chatData = {
                chatName: "sender",
                users: [currentId, userId]
            };

            const createdChat = await chatModel.create(chatData);
            const fullChat = await chatModel
                .findOne({ _id: createdChat._id })
                .populate("users", "-password");                
            return fullChat; 

        } catch (error) {
            throw new Error(error as string);
        }
    }

    async fetchChat(currentId: string): Promise<any> {
        try {
            const results = await chatModel.find({ users: { $elemMatch: { $eq: currentId } } })
                .populate("users", "-password") 
                .populate("latestMessage")      
                .sort({ updatedAt: -1 });       

            const populatedResults = await UserModel.populate(results, {
                path: "latestMessage.sender",
                select: 'name image email'      // Populate the sender of the latest message
            });

            return populatedResults;

        } catch (error) {
            throw new Error(error as string);
        }
    }

    async sendMessage(data:sendMessage): Promise<any> {
        try {    
        const {content,senderId,chatId,mediaType,mediaUrl} = data
        const userObjectId = new mongoose.Types.ObjectId(senderId)
        const chatObjectId = new mongoose.Types.ObjectId(chatId)

        const newMessage:any = {
            sender:userObjectId,
            chat:chatObjectId
        }
        if(content){
            newMessage.content = content
        }

        if(mediaType === 'image'){
            newMessage.image = mediaUrl
        }else if(mediaType === 'video'){
            newMessage.video = mediaUrl
        }else if(mediaType === 'audio'){
            newMessage.audio = mediaUrl
        }
        
        var message = await messageModel.create(newMessage);

        message = await message.populate('sender', 'name image');
        message = await message.populate('chat');
        let messages = await UserModel.populate(message, {
            path: 'chat.users',
            select: 'name image email',
        });
         
        await chatModel.findByIdAndUpdate(chatId, {
            latestMessage: messages,
        });

        return messages;
        } catch (error) {
          console.error("Error sending message:", error);
          throw new Error("Failed to send message");
        }
      }
     async allMessage(chatId: string): Promise<any> {
          try {
            const messages = await messageModel.find({chat:chatId}).populate("sender","name image email").populate("chat")
             return messages
          } catch (error) {
            throw new Error("Failed to send message");
          }
      }

      async deleteMessage(msgId: string): Promise<any> {
          try {
             const deletemessage = await messageModel.findByIdAndDelete(msgId)
          if(deletemessage){
            return deletemessage._id
          }    
          } catch (error) {
            throw new Error("Failed to delete Message");
          }
      }
}

export default ChatRepository;
