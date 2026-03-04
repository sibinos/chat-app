const jwt=require('jsonwebtoken');
const { User } = require('../models/User');
const protectedRoute=async(req,res,next)=>{
    try {
    const authHeader=req.headers.authorization;
    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({success:false,message:'Not authorized, no token'});
    }
    const token=authHeader.split(" ")[1];
    const decode=jwt.verify(token,process.env.JWT_SECRET);
    const user= await User.findById(decode.userID).select('-password');
    if(!user){
        return res.status(404).json({success:false,message:'uer not found'});
    }
    req.user=user;
    next();
    } catch (error) {
       console.log(error);
       return res.json({success:false,message:'token invalid'});
    }
    
}
module.exports={protectedRoute}