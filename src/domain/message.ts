import mongoose from "mongoose";

export interface Message extends Document {
    sender: mongoose.Schema.Types.ObjectId;
    content: string;
    chat: mongoose.Schema.Types.ObjectId;
  }