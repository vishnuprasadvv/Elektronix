const session  = require('express-session');
const express= require('express')
const app = express();

app.use(session({
    secret:'secret',
    resave:false,
    saveUninitialized:false
}));

function isAdminAuth(req,res,next){
    if(req.session.adminAuth){
        next()
    }else{
        res.redirect('/admin/login')
    }
}

function isAdminLogout(req,res,next){
    if(req.session.adminAuth){
        res.redirect('/admin/dashboard')
    }else{
        next()
    }
}

module.exports={isAdminAuth,isAdminLogout}