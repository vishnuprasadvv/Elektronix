const express= require('express');
require('dotenv').config() 
const app = express();
const port= process.env.PORT || 5000;
const userRouter=  require('./routes/user')
const adminRouter=  require('./routes/admin')
const mongoose= require('mongoose')
const path= require('path')
const cors= require('cors')
const ProductsCollection= require('./models/products')
const nocache= require('nocache')
const passport = require('passport')
const authRoute = require('./routes/auth')
const middlewareCartQty = require('./middlewares/cartQuantity')
const middlewareWishlistQty = require('./middlewares/wishlistQty');

//google auth 
const passportStategy = require('./passport')
const session = require('express-session')

app.use(session({
    secret:'secret',
    resave:false,
    saveUninitialized:false
}));

  
app.use(cors())
//nocache
app.use(nocache())
//connect to server
mongoose.connect(process.env.MONGO_URI)  
.then(()=>{console.log('DB Connection successful')})
.catch((error=>console.log(error)))

//parse body
app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use(passport.initialize())
app.use(passport.session())

//set view engine
app.set('view engine' , 'ejs')
 
//middleware cart quantity 
app.use(middlewareCartQty)
app.use(middlewareWishlistQty)
app.use('/auth',authRoute)



//user router
app.use('/',userRouter)

//admin router
app.use('/admin',adminRouter)

//home route 
//set static path
app.use(express.static(path.join(__dirname,'public')))
app.use(express.static(path.join(__dirname, 'node_modules')));

app.use('/',async(req,res)=>{
    
    const latestProducts= await ProductsCollection.aggregate([{$sort:{added_date:-1}},{$limit:5}])
    const trendProducts = await ProductsCollection.find({}).limit(4)
    const products = await ProductsCollection.find().populate('category')
    const userLogged= req.session.isAuth;
    
    res.render('home' ,{title:"Elektronix",latestProducts,trendProducts,products,userLogged})
})

app.use("*",(req,res)=>{
    res.status(400).render('404') 
})

app.listen(port, ()=> console.log(`server started at ${port}`));