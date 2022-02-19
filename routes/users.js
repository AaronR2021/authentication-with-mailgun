var express = require('express');
const { json } = require('express/lib/response');
var jwt=require('jsonwebtoken');
var router = express.Router();
var User =require('../models/user')
var auth=require('../middleware/auth')

const mailgun = require("mailgun-js");
const DOMAIN = 'sandbox44717b3aea6842908c4ee4ceb51fe81a.mailgun.org';
const mg = mailgun({apiKey: '8f7ca88526c14804b44a252142aaad60-c3d1d1eb-588b857d', domain: DOMAIN});

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
      User.findOne({email},async (err,user)=>{
        if(user!=null){
          res.json({
            error:"user already exists"
          })
        }
        
        else{
//create a token with email and send mail.
          var payload={email,password,name}
          try{
              var token=await jwt.sign(payload,'email');
          }
          catch(error){
              next(error)
          }

          const data = {
            from: 'noreply@canvas.com',
            to: `${email}`,
            subject: 'click the link to complete registration',
            html: `<h2>Click the link to activate account</h2>
                    <a href='http://localhost:3000/users/auth/emailvalid/${token}}>Click Me</a>`
          };
          mg.messages().send(data, function (error, body) {
           res.status(200).json({message:'check your mail'})
          });  
        }
      })
})
.get('/auth/emailvalid/:id',async (req,res)=>{
 console.log(req.params.id)
 var token=req.params.id;
 var payload=await jwt.verify(token,'email')
 var {email,password,name}=payload;
 //should be an email, username and password
 User.findOne({email},(err,user)=>{
   if(err){next(err)}
   if(user!=null){
    res.json({
      error:"user already exists"
    })
  }
  else{
    User.create({email,password,name},(err,userCreated)=>{
      res.status(200).json({message:'your account is created. Now go login'})
    })
   
  }
 })

})
.post('/upload',auth.verifyToken,(req,res)=>{
  res.json({
    access:'access pretected resource'
  })
})

module.exports = router;
