import { chatRepo } from "../../useCase/interface/chatRepo";
import chatModel from "../database/chatModel";
import UserModel from "../database/userModel";
import messageModel from "../database/messageModel";
import { Message } from "../../domain/message";
import mongoose from "mongoose";


class ChatRepository implements chatRepo {

    async accessChat(currentId: string, userId: string): Promise<any> {
        try {
            if (!userId) {
                console.log('userId not found');
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
                isGroupChat: false,
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
                .populate("users", "-password") // Populate users but exclude the password field
                .populate("latestMessage")      // Populate the latest message field
                .sort({ updatedAt: -1 });       // Sort the chats by the most recently updated

            const populatedResults = await UserModel.populate(results, {
                path: "latestMessage.sender",
                select: 'name image email'      // Populate the sender of the latest message
            });

            return populatedResults;

        } catch (error) {
            throw new Error(error as string);
        }
    }

    async sendMessage(userId: string, content: string, chatId: string): Promise<any> {
        try {
          const userObjectId = new mongoose.Types.ObjectId(userId);
          const chatObjectId = new mongoose.Types.ObjectId(chatId);

          const newMessage = {
            sender: userObjectId,
            content: content,
            chat: chatObjectId,
          };
      
          var message = await messageModel.create(newMessage);
     
          message = await message.populate('sender', 'name image')
          message = await message.populate('chat');
         let messages = await UserModel.populate(message,{
            path:'chat.users',
            select:'name image email'
          })
      
           await chatModel.findByIdAndUpdate(chatId,{
            latestMessage:messages
           })
        
           return messages
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
}

export default ChatRepository;
