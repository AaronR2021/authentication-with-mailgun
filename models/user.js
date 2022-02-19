var mongoose=require('mongoose');
var bcrypt=require('bcrypt');
const jwt = require('jsonwebtoken');
var Schema=mongoose.Schema;

var userSchema=new Schema({
    name:{type:String,required:true},
    email:{type:String,required:true},
    url:{type:[String]},
    password:String
},{timestamps:true})


userSchema.pre('save',async function (next){
    if(this.password && this.isModified('password')){
        this.password=await bcrypt.hash(this.password,10)
    }
    next()
})

userSchema.methods.verifyPassword=async function(password){
    var result=await bcrypt.compare(password,this.password)
    return result
}

userSchema.methods.signToken=async function(){
    var payload={userId:this.id}
    try{
        var token=await jwt.sign(payload,'somesecretstorein-dot.env');
        return token;
    }
    catch(error){
        next(error)
    }
}
userSchema.methods.successValue=async function(token){
    value={email:this.email,name:this.name,token:token}
    return value
}

module.exports=mongoose.model('User', userSchema);