const express = require("express")
const sgMail = require("@sendgrid/mail");
const UserModel=require('../../models/userModel')
var bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(10); 
 

const registerController= async  (req, res) => { 

 
    let loggedInUser = {};

    let msgData = {};
      let fname = req.body.fname;
      let lname = req.body.lname;
      let email = req.body.email;
      let password = req.body.password;
      let onlySpaces = /^\s+$/;
      let emailValid = /^[0-9a-zA-Z_]+@[a-zA-Z_]+\.[a-zA-Z]+$/;
      let passValid =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[*.!@$%^&(){}:<>.?~#]).{8,12}$/;
      if (fname == "" || fname == null || onlySpaces.test(fname)) {
        msgData.fnameMsg = "Please enter a valid first name";
      }
      if (lname == "" || lname == null || onlySpaces.test(lname)) {
        msgData.lnameMsg = "Please enter a valid last name";
      }
      if (
        email == "" ||
        email == null ||
        onlySpaces.test(email || !emailValid.test(email))
      ) {
        msgData.emailMsg = "Please enter a valid email address";
      }
      if (
        password == "" ||
        password == null ||
        onlySpaces.test(password) ||
        !passValid.test(password)
      ) {
        msgData.passwordMsg =
          "Please enter a valid password with atleast 8 and maximum 12 characters, atleast one uppercase, one lowercase, one number and one special character";
      }
      if (
        msgData.fnameMsg ||
        msgData.lnameMsg ||
        msgData.emailMsg ||
        msgData.passwordMsg
      ) {
        msgData.fname = fname;
        msgData.lname = lname;
        msgData.email = email;
        msgData.password = password;
        res.render("sign-up", msgData);
      } else {
        //check for email in spam and promotions folder,it would be in one of them
    
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const msg = {
          to: email,
          from: "fardeenwebassignment@gmail.com",
          subject: "Welcome to Cozy Corner",
          text: `Hi Welcome to Cozy Corner ${fname}, We are glad to have you with us.`,
        };
        sgMail
          .send(msg)
          .then(() => {
            console.log("Email sent");
          })
          .catch((error) => {
            console.error(error);
          });
    
        loggedInUser.email = email;

        /// create entry in the mongodb 

        const checkEmailExist=await UserModel.findOne({email:email});
        if(checkEmailExist==null){
          var hashPassword = bcrypt.hashSync(password, salt);
          const result= await UserModel.create({
            email:email,
            password:hashPassword,
            fname:fname,
            lname:lname
          });
        //   res.send( {status:'200',message:'Registered Successfully.'} );
        //   msgData.passwordMsg ="Email already exist.";
          res.redirect("/welcome");
        }else{
            // res.send( {status:'404',message:'User already exist.'});
            msgData.passwordMsg ="Email already exist.";
            res.render("sign-up", msgData);
        }
    
        


    
    
       
      }
     




}



module.exports = registerController