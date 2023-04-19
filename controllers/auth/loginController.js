const express = require("express") 
const UserModel=require('../../models/userModel')
var bcrypt = require('bcryptjs');
 
 

const loginController= async  (req, res) => { 
 
  let loggedInUser = {};
  let msgData = {};
  let email = req.body.email;
  let password = req.body.password;
  let userType = req.body.userType;
  let onlySpaces = /^\s+$/;
  let emailValid = /^[0-9a-zA-Z_]+@[a-zA-Z_]+\.[a-zA-Z]+$/;
  if (email == "" || email == null || onlySpaces.test(email) || !emailValid.test(email)) {
    msgData.emailMsg = "Please enter a valid email address";
  }
  if (password == "" || password == null || onlySpaces.test(password)) {
    msgData.passwordMsg = "Please enter your password";
  }


  if (msgData.emailMsg || msgData.passwordMsg || !emailValid.test(email)) {
    msgData.email = email;
    msgData.password = password;
    res.render("log-in", msgData);
  } else {

        loggedInUser.email = email;
        loggedInUser.userType=userType;

   
        const result= await UserModel.findOne({email:email});
        
        if(result && bcrypt.compareSync(password, result.password)){
          loggedInUser.fname = result.fname;
          loggedInUser.id = result._id;
          req.session.userData=loggedInUser;
          req.session.save();
          
          // res.redirect("/welcome"); 
          if(userType==='Customer'){
            res.redirect("cart");
            console.log(req.session);
          }else{
            res.redirect("rentals/list");
            console.log(req.session);
          }
          

        }else{
          msgData.passwordMsg = "“Sorry, you entered an invalid email and/or password";
          res.render("log-in", msgData);
        }

   
  }

}



module.exports = loginController