import mongoose,{Model,Document,Schema} from "mongoose";
import { dogPost } from "../../domain/dogPost";


const dogPostSchema:Schema<dogPost&Document> = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
         },
        image:{
            type:[String],
            required:true
        },
        description:{
            type:String,
            required:true
        },
        likes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],
        comments: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }],
        createdAt: {
            type: Date,
            default: Date.now
        }
})

const DogPost:Model<dogPost&Document> = mongoose.model("DogPost",dogPostSchema)


export default DogPost
