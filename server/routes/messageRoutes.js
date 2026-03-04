const express=require('express');
const { protectedRoute } = require('../middleware/auth');
const { getUserForSidebar, getMessages, markMessageAsSeen, sendMessage } = require('../controllers/messageController');

const MessageRouter=express.Router();

MessageRouter.get("/users",protectedRoute,getUserForSidebar);
MessageRouter.get("/:id",protectedRoute,getMessages);
MessageRouter.put("/mark/:id",protectedRoute,markMessageAsSeen);
MessageRouter.post("/send/:id",protectedRoute,sendMessage)

module.exports={MessageRouter};