import jwt from "jsonwebtoken";

export const protect=(req,res,next)=>{
    const token=req.cookies.jwt
    if(!token)
        return res.status(401).json({message:"no token"})

    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        // Normalize id so req.user.id always exists, whether token came from register or login
        req.user = {
            ...decoded,
            id: decoded.id || decoded._id
        };
        next()
    } catch (error) {
        res.status(401).json({message:"invalid token"})
    }
}