import VerifiedKennelOwner from "../../../domain/verifiedKennelOwner";
import cages from "../../../domain/cages";
import booking from "../../../domain/Booking";

interface verifiedKennelOwnerRepo{
   save(kennelOwner:any):Promise<VerifiedKennelOwner>
   findByEmail(email:string):Promise<VerifiedKennelOwner|null>
   getProfile(id:string):Promise<VerifiedKennelOwner|null>
   savecage(data:cages):Promise<cages|null>
   getCages(): Promise<cages[] | null>;
   getSingleCage(id:string):Promise<cages|null>
   savebooking(data:savebooking):Promise<boolean|null>
   getownerscages(id:string,page:number,limit:number,searchTerm:string):Promise<{cage:{}[],total:number}>
   getCageById(id:string):Promise<cages|null>
   updatecage(id:string,data:cages):Promise<cages|null>
   findById(id:string):Promise<VerifiedKennelOwner|null>
   updateProfile(id:string,data:VerifiedKennelOwner):Promise<VerifiedKennelOwner|null>
   getbookings(id:string):Promise<booking[]|null>
   cancelBooking(bookingid:string,cageid:string):Promise<boolean>
   getAllBookingWithUserDetails():Promise<booking[]|null>
}

 export interface savebooking{
   cageid:string,
   fromDate:string
   kennelName:string,
   ownerid:string,
   toDate:string,
   totalAmount:number,
   totalDays:number,
   userId:string
}

export default verifiedKennelOwnerRepo