import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext=createContext();

export const ChatProvider=({children})=>{

    const [messages,setMessages]=useState([]);
    const [users,setUsers]=useState([]);
    const [selectedUser,setSelectedUser]=useState(null);
    const [unseenMessages,setUnseenMessages]=useState({}); //user id no of message un seen

    const {axios,socket}=useContext(AuthContext);
    // function to get all user for sidebar
    const getUsers=async()=>{
        try {
        const {data}= await axios.get("/api/messages/users");
        if(data.success){
            setUsers(data.user)
            setUnseenMessages(data.unseenMessages)
        }
        
        } catch (error) {
            toast.error(error.message)
        }
    }
    // function to get message from a seletd user
    const getMessage= async(userId)=>{
        try {
            const {data}= await axios.get(`/api/messages/${userId}`);
            if(data.success){
                setMessages(data.messages)
            }
        } catch (error) {
            toast.error(error.message)           
        }
    }
    // function to send a message to a selected user
    const sendMessage=async(messageData)=>{
        try {
            const {data}= await axios.post(`/api/messages/send/${selectedUser._id}`,messageData);
            if(data.success){
                setMessages((prevMessages)=>[...prevMessages,data.newMessage]);
            }
        } catch (error) {
            toast.error(error.message)
        }
    }
    // function to subscibe the message for the selected user
    const subscribeMessages= async()=>{
        if(!socket) return;

        socket.on("newMessage",(newMessage)=>{
            if(selectedUser && newMessage.senderId === selectedUser._id){
                newMessage.seen=true;
                setMessages((prevMessages)=>[...prevMessages,newMessage]);
                axios.put(`/api/messages/mark/${newMessage._id}`);
            }else{
                setUnseenMessages((prevUnseenMessages)=>({
                    ...prevUnseenMessages,[newMessage.senderId]: 
                    prevUnseenMessages[newMessage.senderId]? prevUnseenMessages[newMessage.senderId] + 1 : 1
                }))
            }
        })
    }
    //  function to unsbscibe the messages
    const unsubscibeFromMessages =()=>{
        if(socket) socket.off("newMessage")
    }

    useEffect(()=>{
        subscribeMessages();
        return ()=> unsubscibeFromMessages();
    },[socket,selectedUser])


    const value={
        messages,users,selectedUser,getUsers,getMessage,sendMessage,setSelectedUser,unseenMessages,setUnseenMessages
    }

return(
    <ChatContext.Provider value={value}>
        {children}
    </ChatContext.Provider>
)
}