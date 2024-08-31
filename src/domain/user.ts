 export interface User{
    _id:string,
    name:string,
    email:string,
    phone:string,
    password:string,
    isBlocked:boolean,
    isAdmin:boolean,
    isGoogle:boolean,
    image:string,
    otp:number,
    wallet:number
}

 export type OtpDetails = Omit<User, '_id' | 'isBlocked' | 'isAdmin' | 'isGoogle' | 'image'|'wallet'>;
 export type UserDetails = Pick<User, 'name' | 'email' | 'password' | 'phone'>;

