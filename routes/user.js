const express= require('express');
const router= require('express').Router();
const flash= require('connect-flash');
const methodOverride = require('express-method-override')
const cors = require('cors');
const {handlerGetSignup,
    handlePostSignup,
    handleGetLogin,
    handlePostLogin,
    handleGetHome,
    handlePostLogout,
    handleGetVerify,
    handlePostVerify,handleGetforgotPass,handlePostEmail,handleGetForgotOtp,handlePostForgotOtp,handleGetForgotPassReset,handlePostForgotPassReset,
    handlePostResendOtp}= require('../controllers/user/userController')
const {handleGetWishlist,handlePostAddWishlist,handleDeleteWishlist} = require('../controllers/user/wishlistController')
const {handleGetCart,
    handlePostAddCart,handleDeleteItemCart,handleUpdateItemCart
}= require('../controllers/user/cartController')
const {handleGetProfile,handleGetAddAddress,
    handlePostAddAddress,
    handleGetAddresses,
    handleGetEditAddress,
    handlePostEditAddress,handleDeleteAddress,
    handlePostSecurity,
    handleGetSecurity}= require('../controllers/user/profileController')

const {handleGetOrders,handleGetOrder,
    handlePostCancelOrder,
    handlePostReturnOrder,
    handlePostInvoiceDownload,
    handlePatchOrderPaynow,handleGetCancelOrderConfirm}= require('../controllers/user/orderController')

const {handleGetProductsList,handleGetProductView} =require('../controllers/user/productsController')
const {handleGetCheckout,handlePostCheckout,handlePostAddNewAddress} = require('../controllers/user/checkoutController')
const {handleGetWallet} = require('../controllers/user/walletController')

//coupon
const {handlePostApplyCoupon,handlePostCancelCoupon}= require('../controllers/user/couponController')
// for online stripe payment
const {successPaymentRoute,paymentFailedRoute} = require('../controllers/user/paymentController')



//middleware for checking offer valididty
const {updateOfferDetails}= require('../middlewares/checkOffer')
require('dotenv').config();

const session  = require('express-session');
router.use(session({
    secret:"secret",
    resave:false,
    saveUninitialized:false
}))
//middleware fn to check is user already login
function isAuthenticated(req,res,next){
    if(req.session.isAuth==true || req.isAuthenticated()){
        if(req.isAuthenticated()){
            req.session.isAuth = true;
            req.session.user= req.user._id
        }
        next()
    }else{
        res.redirect('/login')
    }
}

function isLoggedOut(req,res,next){
    if(req.session.isAuth==true || req.isAuthenticated()){
        res.redirect('/home')
    }else{
        next()
    }
}

//method override
router.use(methodOverride('_method'));

router.use(cors());

//flash messages module
router.use(flash());
//signup GET route
router.get('/signup',isLoggedOut,handlerGetSignup)
//signup POST route
router.post('/signup',handlePostSignup) 

//login route
router.get('/login',isLoggedOut,handleGetLogin)
//login POST route
router.post('/login',handlePostLogin) 
//logout route
router.post('/logout',handlePostLogout)

//home route
router.get('/home',isAuthenticated,handleGetHome) 
//wishlist GET
router.get('/wishlist',isAuthenticated,updateOfferDetails,handleGetWishlist)
//Cart GET
router.get('/cart',isAuthenticated,updateOfferDetails,handleGetCart)

//profile GET
router.get('/profile',isAuthenticated,handleGetProfile)

//product list GET
router.get('/list',updateOfferDetails,handleGetProductsList)
//product view page GET
router.get('/view',updateOfferDetails,handleGetProductView)

//OTP GET route
router.get('/verify' ,handleGetVerify)

router.post('/verify/:id',handlePostVerify)

//resend otp 
router.post('/resendotp/:id',handlePostResendOtp)

//add adress
router.get ('/profile/addresses',isAuthenticated, handleGetAddresses)
router.get('/profile/:id/address/add',isAuthenticated, handleGetAddAddress)
router.post ('/profile/:id/address/add',isAuthenticated,handlePostAddAddress)
//edit address
router.get('/profile/address/:id/edit',isAuthenticated,handleGetEditAddress)
router.patch ('/profile/address/:id/edit',handlePostEditAddress)
router.delete('/profile/address/:id/delete',handleDeleteAddress)

//edit password
router.get('/profile/security',isAuthenticated,handleGetSecurity)
router.patch ('/profile/:id/security',handlePostSecurity)

//forgot password
router.get('/forgot-password',isAuthenticated,handleGetforgotPass)
router.post('/forgot-password',handlePostEmail)

router.get('/forgot-password-otp',isAuthenticated,handleGetForgotOtp)
router.post('/forgot-password-otp/:id',handlePostForgotOtp)

router.get('/forgot-resetpassword',isAuthenticated,handleGetForgotPassReset)
router.patch('/forgot-resetpassword/:id',handlePostForgotPassReset)

//cart
router.post('/add-to-cart/:id',handlePostAddCart);

router.delete('/cart/:item/delete',handleDeleteItemCart)
router.patch('/cart/:item/update',handleUpdateItemCart)

router.get('/checkout/:id',isAuthenticated,handleGetCheckout)
router.post('/checkout/:id',handlePostCheckout)

//add new address in checkout 
router.post ('/add-address-checkout',handlePostAddNewAddress)
 
//order
router.get('/profile/orders',isAuthenticated,handleGetOrders)
router.get('/profile/orders/:id',isAuthenticated,handleGetOrder)
router.post('/profile/orders/:id/cancel',handlePostCancelOrder)
router.patch('/profile/orders/:id/return',handlePostReturnOrder);
router.get('/profile/orders/:id/reason-cancel',isAuthenticated,handleGetCancelOrderConfirm)

//wishlist 
router.post('/add-to-wishlist/:id',handlePostAddWishlist);
router.delete('/wishlist/:id',handleDeleteWishlist)

//wallet 
router.get('/profile/wallet',isAuthenticated,handleGetWallet)

// router.post('/create-checkout-session',handleCreateCheckOut)
router.get('/success',successPaymentRoute)
router.get('/failed',paymentFailedRoute)

//apply coupon 
router.post('/coupon-apply',handlePostApplyCoupon)
router.post('/coupon/cancel',handlePostCancelCoupon)

//pay after payment failed 
router.post('/profile/orders/:id/create-payment',handlePatchOrderPaynow)

//invoice download 
router.post('/download-invoice/:id',handlePostInvoiceDownload)

//apply wallet amount for checkout 
router.post('/wallet-apply-checkout/:id',)

 
module.exports= router ;
