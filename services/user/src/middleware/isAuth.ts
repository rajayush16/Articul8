import type { Request,Response,NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken"
import dotenv from "dotenv"
import type { IUser } from "../model/User.js";

dotenv.config();

export interface AuthenticatedRequest extends Request {
    user?: IUser | null
}
export const isAuth = async (req:AuthenticatedRequest,res:Response,next:NextFunction): Promise<void> =>{
    try {
        const authHeader = req.headers.authorization;

        if(!authHeader || !authHeader.startsWith("Bearer")){
            res.status(401).json({
                success:false,
                message:"Header not found"
            });
            return;
        }

        const token = authHeader.split(" ")[1];
        if(!token){
            res.status(404).json({
                success:false,
                message:"Token not Found"
            })
        }
        const decodeVal = jwt.verify(token as string,process.env.JWT_SECRET as string) as JwtPayload;

        if(!decodeVal || !decodeVal.user){
            res.status(401).json({
                message:"Token Expired/Invalid"
            })
            return;
        }

        req.user = decodeVal.user;
        next()  
    } catch (error) {
        console.log("JWT ERROR IN IS AUTH: ",error);

        res.status(401).json({
            success:false,
            message:"Please login",            
        })
    }
}