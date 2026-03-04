import axios, { Axios } from "axios";
import { createContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl=import.meta.env.VITE_BACKEND_URL
axios.defaults.baseURL=backendUrl;


export const AuthContext=createContext();

export const AuthProvider = ({children})=>{
    const [token,setToken]=useState(localStorage.getItem("token"));
    const [authUser,setAuthUser] =useState(null);
    const [onlineUser,setOnlineUsers] =useState([]);
    const [socket,setSocket] =useState(null);
    
    // check the user is authanticated and if so,set the user data and connect the socket
    
    const checkAuth= async()=>{
        try {
           const {data}= await axios.get("/api/auth/checkAuth");
           if(data.success){
                setAuthUser(data.user)
                connectSocket(data.user)
           }
        } catch (error) {
           toast.error(error.message) 
        }
    }
    
    //login function to handle user Authantication and socket connection
    
    const login= async(state,credentials)=>{
        try {
            const {data}=await axios.post(`/api/auth/${state}`,credentials);
            
            if(data.success){
            setAuthUser(data.userData);
            connectSocket(data.userData);
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            setToken(data.token);
            localStorage.setItem("token",data.token);
            toast.success(data.message);
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // logout function to handle user logout and socket disconnection
    const logout= async()=>{
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
        setOnlineUsers([]);
        axios.defaults.headers.common['Authorization'] = null;
        toast.success('logged out successfully');
        socket.disconnect();
    }

    // update profile function to hanldle user profile updates
    const updateProfile=async(body)=>{
        try {
            const {data}= await axios.put("/api/auth/updateProfile",body);
            if(data.success){
                setAuthUser(data.user);
                toast.success(data.message);
            }
        } catch (error) {
            toast.error(error.message)
        }
    }



    // connect socket function to handle socket and online user updates
    const connectSocket=(userData)=>{
        if(!userData || socket?.connected) return;
        const newSocket=io(backendUrl,{
            query:{
                userId: userData._id
            }
        }
        )
        newSocket.connect();
        setSocket(newSocket);

        newSocket.on("getOnlineUsers",(userIds)=>{
            setOnlineUsers(userIds);
        })
    }


    useEffect(()=>{
        if(token){
            axios.defaults.headers.common['Authorization']=`Bearer ${token}`;
        }
        checkAuth()
    },[])
    
    const value={
        axios,
        token,
        authUser,
        onlineUser,
        socket,
        login,
        logout,
        updateProfile
    }

    return(
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}