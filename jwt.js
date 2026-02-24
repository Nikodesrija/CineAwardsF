const jwt=require('jsonwebtoken');

const jwtAuthMiddleware=(req,res,next)=>{
    //extract the jwt token from the request headers
    const authorization=req.headers.authorization;
    if(!authorization) {
        return res.status(401).json({error:'invalid token'});
    }
    const token=req.headers.authorization.split(' ')[1];
    if(!token) return res.status(401).json({error:'Unauthorized'});

    try{
        //verify the jwt token

        const decoded=jwt.verify(token,process.env.JWT_SECRET);

        //Attach user information to the request object
        req.user=decoded                               
        next();
    }catch(err){
        console.error(err);
        res.status(401).json({error:'invalid token'});
    }
}

//Function to generate JWT token
const generateToken=(userData)=>{
    //sign() is to generate a new jwt token using user data 
    return jwt.sign(userData,process.env.JWT_SECRET);
}

module.exports={jwtAuthMiddleware,generateToken};