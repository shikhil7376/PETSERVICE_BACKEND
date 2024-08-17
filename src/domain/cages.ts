import mongoose from "mongoose";


interface cages{
    _id:string,
    kennelname:string,
    location:string,
    maxcount:number,
    phone:string,
    pricepernight:number,
    image:string[],
    currentBookings:{
        bookingid:string,
        fromdate:string,
        todate:string,
        userid:string,
        status:string
    }[],
    description:string,
    type:'small'|'medium'|'large'
    ownerId: string;
}

export default cages