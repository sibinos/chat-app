const express=require('express');
const { signup, login, updateProfile, checkAuth } = require('../controllers/userController');
const { protectedRoute } = require('../middleware/auth');

const userRouter= express.Router();

userRouter.post("/signup",signup);
userRouter.post("/login",login);
userRouter.put("/updateProfile",protectedRoute,updateProfile);
userRouter.get("/checkAuth",protectedRoute,checkAuth);

module.exports={userRouter};