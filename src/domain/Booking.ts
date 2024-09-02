

interface booking{
    kennelname:string,
    cageid:string,
    userid:string,
    fromdate:string,
    todate:string,
    totalamount:Number,
    totaldays:Number,
    transactionId:string,
    status:string,
    ownerid:string,
    cageImage: string,
    _id?:string,
    phone?:string,
    adminCommission:Number,
    kennelOwnerProfit:Number,
}

export default booking

export interface AdminDashboardData {
    dailyBookings: number;
    monthlyBookings:number;
    dailyProfit: number;
    monthlyProfit: number;
}