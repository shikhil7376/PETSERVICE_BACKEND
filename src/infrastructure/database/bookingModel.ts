import mongoose, {Model,Document,Schema} from 'mongoose'
import booking from '../../domain/Booking'


const bookingSchema:Schema<booking&Document> = new Schema({
   kennelname:{
     type:String,
     required:true
   },
   cageid:{
    type:String,
    required:true
   },
   userid:{
    type:String,
    required:true
   },
   fromdate:{
    type:String,
    required:true
   },
   todate:{
    type:String,
    required:true
   },
   totalamount:{
    type:Number,
    required:true
   },
   totaldays:{
    type:Number,
    required:true
   },
   adminCommission:{
    type: Number,
    required: true
   },
   kennelOwnerProfit:{
    type: Number,
    required: true
   },
   transactionId:{
    type:String, 
    required:true
   }, 
   status:{
    type:String,
    required:true,
    default:'booked'
   },
  ownerid:{
    type:String,
    required:true
  }
},{timestamps:true})

const Booking:Model<booking&Document> = mongoose.model("Booking",bookingSchema)

export default Booking