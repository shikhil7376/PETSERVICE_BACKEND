import adminRepository from "../infrastructure/repository/adminRepository"
import VerifiedkennelRepository from "../infrastructure/repository/Kennel/verifiedKennelRepository"


class adminUseCase{
    private AdminRepo
    private VerifiedKennlRepo
    constructor(AdminRepo:adminRepository,KennelRepo:VerifiedkennelRepository){
      this.AdminRepo = AdminRepo
      this.VerifiedKennlRepo = KennelRepo
    }
    async  getUsers(page:number,limit:number,searchTerm:string){
        const data = await this.AdminRepo.getUsers(page,limit,searchTerm)        
        if(data){
            return{
                status:200,
                data:data.users,
                total:data.total,
                page,
                limit,
                message:'fetch users succesfully'
            }
        }else{
            return {
                status:400,
                message:'failed to fetch data! please try again..'
            }
        }
    }

    async blockUser(userId:string){
        const result = await this.AdminRepo.blockUser(userId)
        if(result){
            return {
                status:200,
                data:{
                    status:true,
                    message:'blocked user successfully'
                }
            }
        }else{
            return{
                status:400,
                data:{
                    status:false,
                    message:'failed to block user! please try later'
                }
            }
        }
    }
    async unBlockUser(userId:string){
        const result = await this.AdminRepo.unBlockUser(userId)
        if(result){
            return {
                status:200,
                data:{
                    status:true,
                    message:'unblocked user succesfully'
                }
            }
        }else{
            return {
                status:400,
                data:{
                    status:false,
                    message:'failed to unblock user! please try later'
                }
            }
        }
    }

    async getRequests(page:number,limit:number,searchTerm:string){    
        const data = await this.AdminRepo.getkennelRequest(page,limit,searchTerm)
        if(data){
            return{
                status:200,
                data:data.users,
                total:data.total,
                page,
                limit,
                message:'fetch kennel requests succesfully'
            }
        }else{
            return {
                status:400,
                message:'failed to fetch data! please try again..'
            }
        }
    }

    async approveKennel(reqId:string){
        const reqdata = await this.AdminRepo.approveKennelRequest(reqId)
        if(reqdata==false){
            return {
                status:401,
                    data:{
                        status:false,
                        message:'Acoount already exist'
                    }
            }
        }else if(reqId){
            let details = await this.VerifiedKennlRepo.save(reqdata)
            if(details){
                return {
                    status:200,
                    data:{
                        status:true,
                        message:'approved succesfully',
                        details
                    }
                }
            }
        }else{
           return{
            status:400,
            data:{
                status:false,
                message:'failed please try again!!'
            }
           }
        }
    }
    
    async rejectKennel(reqId:string){  
        const reqData = await this.AdminRepo.rejectKennelRequest(reqId)
        if(reqData.status ==true){
            return{
                status:200,
                data:{
                    status:true,
                    message:'rejected succesfully',
                    email:reqData.email
                }
            }
        }else{
            return {
                status:400,
                data:{
                    status:false,
                    message:'please try again '
                }
            }
        }
    }

    async getVerifiedKennelOwner(page:number,limit:number,searchTerm:string){
        const data= await this.AdminRepo.getVerifiedKennelOwner(page,limit,searchTerm)
        if(data){
            return{
                status:200,
                data:data.users,
                total:data.total,
                page,
                limit
            }
        }else{
            return {
                status:400,
                message:'failed to fetch data! please try again..'
            }
        }
    }

    async blockkennelowner(userId:string){
        const result = await this.AdminRepo.blockKennelOwner(userId)
        if(result){
            return {
                status:200,
                data:{
                    status:true,
                    message:'blocked kennelowner successfully'
                }
            }
        }else{
            return{
                status:400,
                data:{
                    status:false,
                    message:'failed to block user! please try later'
                }
            }
        }
    }
    async unblockkennelowner(userId:string){
        const result = await this.AdminRepo.UnblockKennelOwner(userId)
        if(result){
            return {
                status:200,
                data:{
                    status:true,
                    message:'unblocked kennelowner successfully'
                }
            }
        }else{
            return{
                status:400,
                data:{
                    status:false,
                    message:'failed to unblock user! please try later'
                }
            }
        }
    }

    async getDashboard(){
        const response = await this.AdminRepo.getAdminDashboardData()
        if(response){
            return{
                status:200,
                data:{
                    dailyBookings:response.dailyBookings,
                    monthlyBookings:response.monthlyBookings,
                    dailyProfit:response.dailyProfit,
                    monthlyProfit:response.monthlyProfit,
                    message:'data fetch successfully' 
                }
            }
        }else{
            return{
                status:400,
                data:{
                    message:'failed to fetch data'
                }
            }
        }
    }
}

export default adminUseCase