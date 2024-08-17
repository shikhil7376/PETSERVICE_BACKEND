import approve from "../../domain/approve"


interface adminRepo{
    getUsers(page:number,limit:number,searchTerm:string):Promise<{users:{}[],total:number}>
    blockUser(userId:string):Promise<boolean>
    unBlockUser(userId:string):Promise<boolean>
    getkennelRequest(page:number,limit:number,searchTerm:string):Promise<{users:{}[], total:number}>
    approveKennelRequest(reqId:string):Promise<approve | boolean>
    rejectKennelRequest(reqId:string):Promise<{status:boolean;email:string}>
    getVerifiedKennelOwner(page:number,limit:number,searchTerm:string):Promise<{users:{}[], total:number}>
    blockKennelOwner(reqId:string):Promise<boolean>
    UnblockKennelOwner(reqId:string):Promise<boolean>
}


export default adminRepo