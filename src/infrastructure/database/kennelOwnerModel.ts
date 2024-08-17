import mongoose,{Model,Document,Schema} from "mongoose";
import kennelOwner from "../../domain/kennelOwner";

const kennelOwnerSchema:Schema<kennelOwner&Document> = new Schema({
     name:{
        type:String,
        required:true
     },
     email:{
        type:String,
        required:true
     },
     password:{
        type:String,
        required:true
     },
     phone:{
        type:String,
        required:true
     },
     isApproved:{
        type:Boolean,
        default:false
     },
     isBlocked:{
        type:Boolean,
        default:false
     }
    
})

const KennelOwnerModel:Model<kennelOwner&Document> = mongoose.model<kennelOwner&Document>('KennelOwner',kennelOwnerSchema)

export default KennelOwnerModel