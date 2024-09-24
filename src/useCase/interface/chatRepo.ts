import { sendMessage } from "../../domain/message"

export interface chatRepo{
    accessChat(currentId:string,userId:string):Promise<any>
    fetchChat(currentId:string):Promise<any>
    sendMessage(data:sendMessage):Promise<any>
    allMessage(chatId:string):Promise<any>
    deleteMessage(msgId:string):Promise<any>
}