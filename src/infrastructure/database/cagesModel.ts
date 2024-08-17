import mongoose, { Model,Document,Schema } from "mongoose";
import cages from "../../domain/cages";

const cageSchema:Schema<cages&Document> = new Schema({
    kennelname:{
        type:String,
        required:true
    },
    location:{
        type:String,
        required:true
    },
    maxcount:{
        type:Number,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    pricepernight:{
        type:Number,
        required:true
    },
    image:{
        type:[String],
        required:true
    },
    currentBookings:[{
        bookingid:{type:String,required:true},
        fromdate:{type:String,required:true},
        todate:{type:String,required:true},
        userid:{type:String,required:true},
        status:{type:String,required:true},
    }] ,
    description:{
        type:String,
        required:true
    },
    type:{
        type:String,
        required:true,
        enum:['small','medium','large']
    },
    ownerId:{
        type:String,
        ref: 'VerifiedKennelOwner',
        required: true,
    }
})

const Cage:Model<cages&Document> = mongoose.model("Cage",cageSchema)

export default Cage
