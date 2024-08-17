import mongoose,{Model,Document,Schema} from "mongoose";
import VerifiedKennelOwner from "../../domain/verifiedKennelOwner";

const VerifiedkennelOwnerSchema:Schema<VerifiedKennelOwner&Document> = new Schema({
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
    isBlocked:{
       type:Boolean,
       default:false
    },
    image:{
      type:String,
    }
   
})

const VerifiedKennelOwnerModel:Model<VerifiedKennelOwner&Document> = mongoose.model<VerifiedKennelOwner&Document>('VerifiedKennelOwner',VerifiedkennelOwnerSchema)

export default VerifiedKennelOwnerModel