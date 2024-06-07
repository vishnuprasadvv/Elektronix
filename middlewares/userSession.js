const session  = require('express-session');
const express = require('express');
const app= express();

app.use(session({
    secret:"secret",
    resave:false,
    saveUninitialized:false
}))

//middleware fn to check is user already login
function isAuthenticated(req,res,next){
    if(req.session.isAuth){
        next()
    }else{
        res.redirect('/login')
    }
}

function isLoggedOut(req,res,next){
    if(req.session.isAuth){
        res.redirect('/home')
    }else{
        next()
    }
}

module.exports ={isAuthenticated,isLoggedOut}