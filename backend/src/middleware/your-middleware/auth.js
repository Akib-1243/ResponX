import User from "../../models/User.js";
import jwt from 'jsonwebtoken';

export const protect= async (req, res, next) => {
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){

       try{
        token = req.headers.authorization.split(" ")[1];


        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = await User.findById(decoded.id).select("-password");

        return next();

       } catch(err)
       {
        console.error("Token Verification failed: ",err.message);
        return res.status(401).json({message: "Not authorized, token failed"})

       }

    }
    return res.status(401).json({message: "Not authorized, token failed"});
}

// Authorization: [Bearer , <token> ]

// Role-based authorization middleware
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Not authorized, user not found" });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: "Not authorized, insufficient permissions",
                required: roles,
                current: req.user.role
            });
        }

        next();
    };
};

// Check if user is verified (for trusted_volunteer role)
export const requireVerified = (req, res, next) => {
    if (!req.user.isVerified && req.user.role === 'trusted_volunteer') {
        return res.status(403).json({ 
            message: "Not authorized, user not verified",
            role: req.user.role
        });
    }
    next();
};