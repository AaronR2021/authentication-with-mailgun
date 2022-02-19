var express = require('express');
const { json } = require('express/lib/response');
var router = express.Router();
var User =require('../models/user')
var auth=require('../middleware/auth')

/* GET users listing. */
router.get('/', async function(req, res, next) {
  res.send('respond with a resource');
})
.post('/login',(req,res,next)=>{
  var {email,password}=req.body;
  console.log(email,password)
  if(!email||!password){
  console.log('missing fields')

    return res.status(400).json({
      error:"Email/Password required"
    })
  }
  User.findOne({email},async function(err,user){
    if(err) {
      next(err)
    }
    else {
  console.log(user,'user')

      var result=await user.verifyPassword(password);
      if(!result){
        console.log(!result,'1')
        return res.status(400).json({error:'Invalid Password'})
      }
      else{
        //generate password
        var token=await user.signToken()
        var value=await user.successValue(token)
        console.log(token,'token')
        res.json(value)
      }
    }
  })
  
 
  
})
.post('/signin',(req,res,next)=>{
  var {email,password,name}=req.body;
 
  if(!email||!password||!name){
    return res.status(400).json({
      error:"Email/Password/name required"
    })
  }

  //setup
      User.findOne({email},(err,user)=>{
        console.log(user,err)
        if(user!=null){
          res.json({
            error:"user already exists"
          })
        }
        else{
  //signing up
  try{
    User.create(req.body,(error,user)=>{ 
      if(error){
        console.log('error created')
      return next(error)
        }
      else{
        console.log('created successfully created')
        res.json({
          message:"user successfully register now please login"
        })
      }
  })
  }catch(e){
    next(e)
  }
  
        }
      })


 
  
})
.post('/upload',auth.verifyToken,(req,res)=>{
  res.json({
    access:'access pretected resource'
  })
})

module.exports = router;
