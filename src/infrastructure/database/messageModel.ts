
import mongoose ,{Model,Document,Schema} from "mongoose";
import { Message } from "../../domain/message";


const messageSchema: Schema<Message&Document> = new Schema(
    {
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      content: {
        type: String,
        trim: true,
      },
      chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
        required: true,
      },
      image:{
        type:String,
    },
    audio:{
      type:String
    },
    video:{
      type:String
    }
    },
    { timestamps: true }
  );
  
  
  const messageModel: Model<Message&Document> = mongoose.model<Message&Document>("Message", messageSchema);
  
  export default messageModel;