import mongoose,{Model,Document,Schema}  from "mongoose";
import { Report } from "../../domain/reportPost";


const reportSchema:Schema = new Schema<Report|Document>({
      reporterId :{
          type:mongoose.Schema.Types.ObjectId,
          ref:'User',
          required:true
      },
      postId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Post",
        required:true
      },
      reason:{
        type:String,
        required:true
      },
      status:{
        type:String,
        enum:['Pending','Resolved'],
        default:"Pending"
      },
      createdAt:{
        type:Date,
        default:Date.now()
      },
      updatedAt:{
        type:Date
      }
})

const ReportModel:Model<Report&Document> = mongoose.model<Report&Document>("ReportPost",reportSchema)

export default ReportModel 