import { Request,Response,NextFunction } from "express";
import jwt,{JwtPayload} from 'jsonwebtoken'
import VerifiedKennelOwnerModel from "../database/VerifiedKennelownerModel";
import { Role } from "../../utils/enums";
import { StatusCode } from "../../utils/enums";

export const kennelAuth = async(req:Request,res:Response,next:NextFunction)=>{    
    const authHeader = req.headers.authorization;

    if(!authHeader||!authHeader.startsWith("Bearer ")){
        return res
        .status(StatusCode.unauthorized)
        .json({message:"Authorization header missing or invalid"})
    }
    const token  = authHeader.split(" ")[1];

    try {
         const decodedToken = jwt.verify(token,process.env.JWT_SECRET_KEY as string) as JwtPayload         
         if(decodedToken.role!==Role.verifiedkennelowner){
            return res.status(StatusCode.forbidden).json({message:'Unauthorized access'})
         }
         const userId = decodedToken.userId
         const user = await VerifiedKennelOwnerModel.findById(userId)
         if(!user){
            return res.status(StatusCode.badRequest).json({ message: "kennelOwner not found" });
         }
         if(user.isBlocked){
            return res.status(StatusCode.badRequest).json({ message: "kennelowner is blocked", accountType: "verifiedkennelowner" });

         }
         next()
    } catch (error:any) {
        console.error("Error decoding token:", error.message);
        return res.status(StatusCode.badRequest).json({ message: "Not found" });
    }
}