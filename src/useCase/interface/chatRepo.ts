

export interface chatRepo{
    accessChat(currentId:string,userId:string):Promise<any>
    fetchChat(currentId:string):Promise<any>
    sendMessage(userId:string,content:string,chatId:string):Promise<any>
    allMessage(chatId:string):Promise<any>
}