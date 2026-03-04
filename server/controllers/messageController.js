const { cloudinary } = require("../lib/cloudinary");
const { Message } = require("../models/message");
const { User } = require("../models/User");
// const { userSocketMap} = require("../server");

// get all users expect the logged in user - for showing the side bar
const getUserForSidebar=async(req,res)=>{
    try {
        const userId=req.user._id;
        filterUsers=await User.find({_id:{$ne:userId}}).select('-password');
        //count number of messages not seen by logged user
        const unseenMessages={};
        const promises = filterUsers.map(async(user)=>{
            const message= await Message.find({senderId:user._id,receiverId:userId,seen:false})
        if(message.length > 0){
            unseenMessages[user._id]=message.length;
        }
        });
        await Promise.all(promises);
        res.status(200).json({success:true,user:filterUsers,unseenMessages})
    } catch (error) {
        console.log(error)
        res.status(500).json({success:false,message:error.message})
    }
}

// get all the messsage for the selected user and update seen ture

const getMessages= async (req,res)=>{
    try{
        const {id:selectedUserId}=req.params;
        const myId=req.user._id;
        const messages=await Message.find({
            $or:[
                {senderId:myId, receiverId:selectedUserId},
                {senderId:selectedUserId, receiverId:myId},
                ]
        });
        await Message.updateMany({senderId:selectedUserId,receiverId:myId},{seen:true});
        res.json({success:true,messages});
    }catch(error){
        console.log(error)
        res.status(500).json({success:false,message:error.message})
    }

}

// api to mark as seen using message id

const markMessageAsSeen = async(req,res)=>{
    try {
        const {id}=req.params;
        await Message.findByIdAndUpdate(id,{seen:true})
        res.status(200).json({success:true,message:'succesfully updated'});
        
    } catch (error) {
        console.log(error)
        res.status(500).json({success:false,message:error.message})
    }
}

//  for sending message to the selectes user

const sendMessage= async(req,res)=>{
    try {
        const {text,image}= req.body;
        const receiverId=req.params.id;
        const senderId=req.user._id;
        const io = req.app.get('io');
        const userSocketMap = req.app.get('userSocketMap');

        if (!text && !image) {
            return res.status(400).json({success: false,message: "Message cannot be empty"});
        }

        let imageUrl;
        if(image){
            const uploadResponse= await cloudinary.uploader.upload(image);
            imageUrl=uploadResponse.secure_url;
        }
        const newMessage= await Message.create({senderId,receiverId,text,image:imageUrl});
        
        // emit the new messages to the reciver's socket
        const receiverSocketId=userSocketMap[receiverId];
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage",newMessage)
        }
        res.status(201).json({success:true,newMessage})

    } catch (error) {
        console.log(error)
        res.status(500).json({success:false,message:error.message})
    }
}


module.exports={getUserForSidebar,getMessages,markMessageAsSeen,sendMessage};