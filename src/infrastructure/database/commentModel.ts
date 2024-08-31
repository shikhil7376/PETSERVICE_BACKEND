import mongoose,{Model,Document,Schema} from "mongoose";
import { Comment} from "../../domain/Comment";


const commentSchema:Schema<Comment& Document> = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DogPost",
        required: true
    },
    text: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const CommentModel:Model<Comment& Document> = mongoose.model("Comment",commentSchema)

export default CommentModel;