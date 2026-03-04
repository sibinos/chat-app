//sign up new user

const { cloudinary } = require("../lib/cloudinary");
const { generateToken } = require("../lib/utils");
const { User } = require("../models/User");
const bcrypt =require('bcryptjs')

const signup= async (req,res) =>{
    const {fullName,email,password,bio}= req.body;
    try {
      if(!fullName || !email || !password || !bio) {
         return res.json({success:false,message:'missing credentials'})
      }
      const user = await User.findOne({email});
      if(user){
        return res.json({success:false,message:'User already exist'})
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword= await bcrypt.hash(password,salt);

      const newUser= await User.create({
        fullName, email, password: hashedPassword, bio
      })
      const token = generateToken(newUser._id)
      res.json({success:true,userData:newUser,token,message:'Account created sucessfully'});
    } catch (error) {
        console.log(error.message);
        res.json({success:false,message: error.message})
    }
}

// controller to a login function

const login = async (req,res)=>{
   const {email,password}=req.body;
   try {
    const userData=await User.findOne({email});
    if(!userData){
        return res.json({success:false,message:'User not exist'});
    }
    const isPasswordCorrect= await bcrypt.compare(password,userData.password);
    if (!isPasswordCorrect) {
        return res.json({success:false,message:'wrong credentials'})
    }
    const token=generateToken(userData._id);
    res.json({success:true,userData,token,message:'Login sucessfull'})
   } catch (error) {
    console.log(error.message);
    res.json({success:false,message: error.message})
   }
}

//authantication check
const checkAuth=(req,res)=>{
    return res.json({success:true,user:req.user})
}

// controller to update user profile

const updateProfile = async (req,res)=>{
    try {
        const {profilePic,bio,fullName}=req.body;
        const userID=req.user._id;

        if(!profilePic && !bio && !fullName){
            return res.status(404).json({success:false,message:'No data provided to update'});
        }
        let updateData={};
        if(bio) updateData.bio=bio;
        if(fullName) updateData.fullName=fullName;
        
        //upload image if it given
        
        if(profilePic){
            const upload = await cloudinary.uploader.upload(profilePic);
            updateData.profilePic=upload.secure_url;
        }
        const updatedUser= await User.findByIdAndUpdate(userID,updateData,{new:true}).select('-password')
        res.status(200).json({success:true,user:updatedUser,message:'Profile updated sucessfully'})
    } catch (error) {
        console.log(error)
        res.status(500).json({success:false,message:error.message});
    }
};

module.exports={login,signup,checkAuth,updateProfile}