import VerifiedKennelOwner from "../../../domain/verifiedKennelOwner";
import VerifiedKennelOwnerModel from "../../database/VerifiedKennelownerModel";
import verifiedKennelOwnerRepo from "../../../useCase/interface/Kennel/VerifiedKennelRepo";
import cages from "../../../domain/cages";
import Cage from "../../database/cagesModel";
import booking, { AdminDashboardData } from "../../../domain/Booking";
import Booking from "../../database/bookingModel";
import { savebooking } from "../../../useCase/interface/Kennel/VerifiedKennelRepo";
import UserModel from "../../database/userModel";
import { format, parse, isValid, startOfDay, endOfDay } from 'date-fns';

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
  console.log(data);

    const newbooking = new Booking({
        kennelname:data.kennelName,
        cageid:data.cageid,
        userid:data.userId,
        fromdate:data.fromDate,
        todate:data.toDate,
        totalamount:data.totalAmount,
        totaldays:data.totalDays,
        ownerid:data.ownerid,
        kennelOwnerProfit:data.kennelOwnerProfit,
        adminCommission:data.adminCommission,
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

async cancelBooking(bookingid: string, cageid: string): Promise<boolean> {
    const booking = await Booking.findById({ _id: bookingid });
    if (booking) {
        booking.status = 'cancelled';
        await booking.save();

        const cage = await Cage.findById({ _id: cageid });
        if (cage) {
            cage.currentBookings = cage.currentBookings.filter(booking => booking.bookingid !== bookingid);
            await cage.save();
        }

        const user = await UserModel.findById(booking.userid);
        if (user) {
            user.wallet += booking.totalamount.valueOf(); 
            await user.save();
        }

        return true;
    }

    return false;
}

 async getAllBookingWithUserDetails(): Promise<booking[] | null> {
    try {
        const bookings = await Booking.aggregate([
          {
            $addFields: {
              userid: { $toObjectId: "$userid" }, // Convert userid to ObjectId
            },
          },
          {
            $lookup: {
              from: 'users', 
              localField: 'userid', 
              foreignField: '_id', 
              as: 'userDetails', 
            },
          },
          {
            $unwind: '$userDetails', 
          },
          {
            $project: {
              _id: 1,
              kennelname: 1,
              cageid: 1,
              userid: 1,
              fromdate: 1,
              todate: 1,
              totalamount: 1,
              totaldays: 1,
              transactionId: 1,
              status: 1,
              ownerid: 1,
              username: '$userDetails.name', // Extracting the username
              phone: '$userDetails.phone', // Extracting the phone number
            },
          },
        ]);
       
        return bookings;
      } catch (error) {
        console.error('Error fetching bookings with user details:', error);
        throw error;
      }
}


async getKennelOwnerDashboardData(ownerId: string): Promise<AdminDashboardData> {
  const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
  
    const dailyProfitResult = await Booking.aggregate([
      { $match: { createdAt: { $gte: startOfDay, $lte: endOfDay }, ownerid: ownerId, status: { $ne: "cancelled" } } },
      { $group: { _id: null, totalProfit: { $sum: "$kennelOwnerProfit" } } }
  ]);
  const dailyProfit = dailyProfitResult[0]?.totalProfit || 0;

     // Calculate Monthly Profit
     const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
     const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59, 999);
 
     const monthlyProfitResult = await Booking.aggregate([
         { $match: { createdAt: { $gte: startOfMonth, $lte: endOfMonth }, ownerid: ownerId, status: { $ne: "cancelled" } } },
         { $group: { _id: null, totalProfit: { $sum: "$kennelOwnerProfit" } } }
     ]);
     const monthlyProfit = monthlyProfitResult[0]?.totalProfit || 0;

       // Calculate Daily Bookings
    const dailyBookings = await Booking.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      ownerid: ownerId,
      status: { $ne: "cancelled" }
  });

  // Calculate Monthly Bookings
  const monthlyBookings = await Booking.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      ownerid: ownerId,
      status: { $ne: "cancelled" }
  });

  return {
    dailyBookings,
    monthlyBookings,
    dailyProfit,
    monthlyProfit
};

}

}

export default VerifiedkennelRepository