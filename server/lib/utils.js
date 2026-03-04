const jwt = require('jsonwebtoken');
//function for token genaration for user
const generateToken = (userID)=>{
    const token=jwt.sign({userID},process.env.JWT_SECRET)
    return token;
}
module.exports={generateToken}