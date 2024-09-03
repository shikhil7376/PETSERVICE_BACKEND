import mongoose,{Model,Schema,Document} from "mongoose";
import { User } from "../../domain/user";

const useSchema:Schema = new Schema<User|Document>(
    {
        name:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true,
            unique:true
        },
        password:{
            type:String,
            required:true,
        },
        phone:{
            type:String
        },
        isBlocked:{
            type:Boolean,
            default:false
        },
        isAdmin:{
            type:Boolean,
            default:false
        },
        isGoogle:{
            type:Boolean,
            default:false
        },
        image:{
            type:String
        },
        wallet: {
            type: Number,
            default: 0,
          },
       followers:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
       }],
       following:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
       }]
    }
)

const UserModel:Model<User&Document> = mongoose.model<User & Document>("User",useSchema)

export default UserModel