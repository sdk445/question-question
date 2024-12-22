import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";


//override default class to specify req  
interface IGetUserAuthInfoRequest extends Request {
    user: string
}

export const authenticate = (req: IGetUserAuthInfoRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1]; // Extract token from Authorization header

    if (!token) {
         res.status(401).json({ error: "Unauthorized access. Token required." });
         return;
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        req.user = decoded;
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        res.status(401).json({ error: "Invalid or expired token." });
    }
};
