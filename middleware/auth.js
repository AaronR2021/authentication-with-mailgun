var jwt=require('jsonwebtoken');

module.exports={
    verifyToken: async(req,res,next)=>{
        console.log(req.headers)
        var token=req.headers.authorization;
        console.log('token:',token)
        try{
            if(token){
                var payload=await jwt.verify(token,'somesecretstorein-dot.env')
                console.log('payload',payload)
                req.user=payload;
                next()
            }
            else{
                res.status(400).json({error:'token required'})
                }
        }
        catch(error){
           next(error)
        }
    }
}