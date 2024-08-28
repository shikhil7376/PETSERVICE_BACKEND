import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { Role } from '../../utils/enums';
import { StatusCode } from '../../utils/enums';

export const adminAuth = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
          .status(StatusCode.unauthorized)
          .json({ message: "Authorization header missing or invalid" });
    }

    const token = authHeader.split(' ')[1];
      
    try {
        const decodedToken = jwt.verify(
          token,
          process.env.JWT_SECRET_KEY as string
        ) as JwtPayload;
    
        if (decodedToken.role !== Role.admin) {
          return res.status(StatusCode.forbidden).json({ message: "Unauthorized access" });
        }
    
        next();
      } catch (error: any) {
        console.error("Error decoding token:", error.message);
        return res.status(StatusCode.unauthorized).json({ message: "Not found" });
      }
   
};
