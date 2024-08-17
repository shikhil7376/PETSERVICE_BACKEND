import { Request,Response,NextFunction } from "express";
import jwt,{JwtPayload} from 'jsonwebtoken'
import VerifiedKennelOwnerModel from "../database/VerifiedKennelownerModel";


export const kennelAuth = async(req:Request,res:Response,next:NextFunction)=>{    
    const authHeader = req.headers.authorization;

    if(!authHeader||!authHeader.startsWith("Bearer ")){
        return res
        .status(401)
        .json({message:"Authorization header missing or invalid"})
    }
    const token  = authHeader.split(" ")[1];

    try {
         const decodedToken = jwt.verify(token,process.env.JWT_SECRET_KEY as string) as JwtPayload         
         if(decodedToken.role!=='verifiedkennelowner'){
            return res.status(403).json({message:'Unauthorized access'})
         }
         const userId = decodedToken.userId
         const user = await VerifiedKennelOwnerModel.findById(userId)
         if(!user){
            return res.status(400).json({ message: "kennelOwner not found" });
         }
         if(user.isBlocked){
            return res.status(400).json({ message: "kennelowner is blocked", accountType: "verifiedkennelowner" });

         }
         next()
    } catch (error:any) {
        console.error("Error decoding token:", error.message);
        return res.status(400).json({ message: "Not found" });
    }
}