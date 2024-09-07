
import mongoose ,{Model,Document,Schema} from "mongoose";
import { Message } from "../../domain/message";


const messageSchema: Schema<Message> = new Schema(
    {
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      content: {
        type: String,
        trim: true,
        required: true,
      },
      chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
        required: true,
      },
    },
    { timestamps: true }
  );
  
  
  const messageModel: Model<Message> = mongoose.model<Message>("Message", messageSchema);
  
  export default messageModel;