const mongoose=require('mongoose')
const {rentalConnection} = require('../dbConnection/dbconnect');

 

const userSchema= new mongoose.Schema({
    
    email:{type:String,required:true,unique: true },
    fname:{type:String,required:true },
    lname:{type:String,required:true },
    password:{type:String,required:true },
  

},{collection:'users'});

const model=rentalConnection.model('userModel',userSchema);

module.exports=model


 