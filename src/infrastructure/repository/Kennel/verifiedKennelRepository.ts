import VerifiedKennelOwner from "../../../domain/verifiedKennelOwner";
import VerifiedKennelOwnerModel from "../../database/VerifiedKennelownerModel";
import verifiedKennelOwnerRepo from "../../../useCase/interface/Kennel/VerifiedKennelRepo";
import cages from "../../../domain/cages";
import Cage from "../../database/cagesModel";
import booking from "../../../domain/Booking";
import Booking from "../../database/bookingModel";
import { savebooking } from "../../../useCase/interface/Kennel/VerifiedKennelRepo";

class VerifiedkennelRepository implements verifiedKennelOwnerRepo{
   async save(kennelOwner: any): Promise<VerifiedKennelOwner> {
       const newKennelOwner = new VerifiedKennelOwnerModel(kennelOwner)
       const savedKennelOwner = await newKennelOwner.save()
       return savedKennelOwner

   }
async getProfile(id: string): Promise<VerifiedKennelOwner | null> {
    const data = await VerifiedKennelOwnerModel.findOne({_id:id})
    return data
}

   async findByEmail(email: string): Promise<VerifiedKennelOwner | null> {
       const verifiedkennelowner = await VerifiedKennelOwnerModel.findOne({email:email})
       return verifiedkennelowner
   }
 async savecage(data: cages): Promise<cages | null> {
     const newcage = new Cage(data) 
     const savedKennel = await newcage.save()
     return savedKennel
 }
 async getCages(): Promise<cages[] | null> {
    const cageList = await Cage.find();
    return cageList;
 }

async getSingleCage(id: string): Promise<cages | null> {
    const cage = await Cage.findById({_id:id})
    return cage
}

async savebooking(data: savebooking): Promise<boolean | null> {
    const newbooking = new Booking({
        kennelname:data.kennelName,
        cageid:data.cageid,
        userid:data.userId,
        fromdate:data.fromDate,
        todate:data.toDate,
        totalamount:data.totalAmount,
        totaldays:data.totalDays,
        ownerid:data.ownerid,
        transactionId:'1234'
     })
     const booking = await newbooking.save()
     const cagetemp = await Cage.findOne({_id:data.cageid})
     cagetemp?.currentBookings.push({bookingid:booking._id as string,fromdate:data.fromDate,todate:data.toDate,userid:data.userId,status:booking.status})
     await cagetemp?.save();
     return true

}

async getownerscages(id: string, page: number, limit: number, searchTerm: string): Promise<{ cage: {}[]; total: number; }> {
    const skip = (page - 1) * limit;
    const query = searchTerm ? 
    {
        ownerId: id,
        $or: [
            { kennelname: { $regex: searchTerm, $options: 'i' } },
            { location: { $regex: searchTerm, $options: 'i' } }
        ]
    } : 
    { ownerId: id };

    const cages = await Cage.find(query).skip(skip).limit(limit).lean();
    const total = await Cage.countDocuments(query);

    return { cage: cages, total };
}

async getCageById(id: string): Promise<cages | null> {
    const cage = await Cage.findById({_id:id})
    return cage
}
 
 async updatecage(id: string, data: cages): Promise<cages | null> {
    const updatedCage = await Cage.findByIdAndUpdate(id, data, { new: true });
    return updatedCage;
}

async findById(id: string): Promise<VerifiedKennelOwner | null> {
    const owner = await VerifiedKennelOwnerModel.findById({_id:id})
    return owner
}

async updateProfile(id: string, data: VerifiedKennelOwner): Promise<VerifiedKennelOwner | null> {
    const updatedProfile = await VerifiedKennelOwnerModel.findByIdAndUpdate(id,data,{new:true})
    return updatedProfile
}

async getbookings(id: string): Promise<booking[] | null> {     
    const bookings = await Booking.find({userid:id}).lean()
    for (let booking of bookings) {
        const cage = await Cage.findById(booking.cageid).select('image').lean();
        if (cage && cage.image && cage.image.length > 0) {
            booking.cageImage = cage.image[0];
        }
    }
    
    return bookings
}   

async cancelBooking(bookingid: string, cageid: string): Promise<void | null> {
    const booking = await Booking.findById({_id:bookingid})
    if(booking){
        booking.status = 'cancelled'
        await booking.save()
        const cage = await Cage.findById({_id:cageid})
        if(cage){
            cage.currentBookings = cage.currentBookings.filter(booking => booking.bookingid!== bookingid)
            await cage.save()
        }
    }
}

}

export default VerifiedkennelRepository