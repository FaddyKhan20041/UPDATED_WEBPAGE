const express = require("express") 
 
 
 
 

const logoutController= async  (req, res) => { 
 
  req.session.destroy(function(err) {
    // cannot access session here
    res.redirect("/log-in");
  })
  // res.redirect("/log-in");
}



module.exports = logoutController