const userCollection = require('../../models/user')
const ProductCollection = require('../../models/products')
const CartCollection = require('../../models/cart')
const WishlistCollection = require('../../models/wishlist')
const token = require('../../models/token');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');



//nodemailer - mail send
const sendVerifyMail = async (name, email, user_id, res) => {
    try {
        const OTP = `${Math.floor(1000 + Math.random() * 9000)}`;
        let user = await userCollection.findById(user_id);
        if (user.isVerified == true) {
            console.log('user already verified')
        } else {
            const transporter = nodemailer.createTransport({
                host: process.env.HOST,
                port: 587,
                secure: false,
                auth: {
                    user: process.env.NODE_EMAIL,
                    pass: process.env.PASS,
                }
            })
            const mailOptions = {
                from: process.env.NODE_EMAIL,
                to: email,
                subject: 'For verification',
                html: '<p> Hi, ' + name + ',<br> Your OTP is ' + OTP + '</p>'
            };
            //hash otp

            const hashedOtp = await bcrypt.hash(OTP, 5);
            const newOtp = new token({
                user_id: user_id,
                otp: hashedOtp,
                createdAt: Date.now(),
                expiresAt: Date.now() + 120000
            });
            //check already otp saved or not
            const isOtpSaved = await token.findOne({ user_id: user_id })
            if (!isOtpSaved) {
                await newOtp.save();
                console.log('otp saved to db')
            } else {
                await token.findOneAndUpdate({ user_id: user_id }, { otp: hashedOtp, createdAt: Date.now(), expiresAt: Date.now() + 120000 }, { upsert: true })
                console.log('otp resaved to db')
            }


            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                }
                else {
                    console.log('Email has been sent:-', info.response);
                }
            })
        }
    }
    catch (error) {
        console.log(error)
    }
}

//for password reset 
const sendResetPassMail = async (name, email, user_id, res) => {
    try {
        const OTP = `${Math.floor(1000 + Math.random() * 9000)}`;
        let user = await userCollection.findById(user_id);

        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            port: 587,
            secure: false,
            auth: {
                user: process.env.NODE_EMAIL,
                pass: process.env.PASS,
            }
        })
        const mailOptions = {
            from: process.env.NODE_EMAIL,
            to: email,
            subject: 'For password reset',
            html: '<p> Hi, ' + name + ',<br> Your OTP is ' + OTP + '</p>'
        };
        //hash otp

        const hashedOtp = await bcrypt.hash(OTP, 5);
        const newOtp = new token({
            user_id: user_id,
            otp: hashedOtp,
            createdAt: Date.now(),
            expiresAt: Date.now() + 120000
        });
        //check already otp saved or not
        const isOtpSaved = await token.findOne({ user_id: user_id })
        if (!isOtpSaved) {
            await newOtp.save();
            console.log('otp saved to db')
        } else {
            await token.findOneAndUpdate({ user_id: user_id }, { otp: hashedOtp, createdAt: Date.now(), expiresAt: Date.now() + 120000 }, { upsert: true })
            console.log('otp resaved to db')
        }


        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            }
            else {
                console.log('Email has been sent:-', info.response);
            }
        })
    }

    catch (error) {
        console.log(error)
    }
}

const handlerGetSignup = (req, res) => {
    const userLogged = req.session.isAuth;
    const alert = req.flash('alert')
    const success = req.flash('success')
    res.render('signup', { title: "Signup", userLogged, alert, success })
}

const handlePostSignup = async (req, res) => {
    let { name, email, phone, password, confirmPassword } = req.body;

    //check user exists or not
    const userExist = await userCollection.findOne({ email });
    if (userExist) {
        req.flash('alert', "User already exist")
        console.log('user already exist')
        res.redirect('/signup')
    } else {

        if (confirmPassword === password) {
            const hashPass = await bcrypt.hash(password, 10);

            password = hashPass; //hashed password

            //const user = new Collection.insertMany({name,email,phone,address,password})
            const user = new userCollection({ name, email, phone, password })
            const userData = await user.save()
            if (userData) {
                await sendVerifyMail(req.body.name, req.body.email, userData._id, res);
                res.redirect('/verify?id=' + userData._id)
            }
        } else {
            console.log('user registration failed')
        }
    }
}

//login
const handleGetLogin = (req, res) => {
    const userLogged = req.session.isAuth;
    const alert = req.flash('alert')
    const success = req.flash('success')

    res.render('login', { title: "Login", userLogged, alert, success })
}

const handlePostLogin = async (req, res) => {
    const { email, password } = req.body;
    const userExist = await userCollection.findOne({ email });
    if (!userExist) {
        console.log('user not registered')
        req.flash('alert', 'User not found, Please register!')
        return res.redirect('/login')
    }
    if (!userExist.password) {
        req.flash('alert', 'Use other login method!')
        return res.redirect('/login')
    }
    const isPassMatch = await bcrypt.compare(password, userExist.password);

    if (userExist.isVerified == false) {
        console.log('user not verified')
        req.flash('alert', 'user not verified')
        await sendVerifyMail(userExist.name, userExist.email, userExist._id, res);
        res.redirect('/verify?id=' + userExist._id)
    } else if (userExist.status == false) {
        req.flash('alert', "user account blocked")
        res.redirect('/login')
    } else if (!isPassMatch) {
        //wrong credential msg
        req.flash('alert', 'Invalid credentials')
        res.redirect('/login')
    } else {
        req.session.isAuth = true;
        req.session.user = userExist._id;
        const cartItems = await CartCollection.findOne({ userId: userExist._id });

        if (cartItems == null) {
            req.session.cart_qty = 0;
        } else {
            const cart_qty = cartItems.items.length;
            req.session.cart_qty = cart_qty;
        }

        //wishlist qty 
        const wishlistItems = await WishlistCollection.findOne({ userId: userExist._id });
        if (wishlistItems == null) {
            req.session.wishlist_qty = 0;
        } else {
            const wishlist_qty = wishlistItems.items.length;
            req.session.wishlist_qty = wishlist_qty;
        }


        res.redirect('/home')
    }
}

//home
const handleGetHome = async (req, res) => {

    const latestProducts = await ProductCollection.aggregate([{ $match: { isDeleted: false } }, { $sort: { added_date: -1 } }, { $limit: 5 }])
    const trendProducts = await ProductCollection.find({ isDeleted: false }).limit(4)
    const products = await ProductCollection.find({ isDeleted: false }).populate('category')
    let userLogged = req.session.isAuth;
    res.render('home', { title: "Home", latestProducts, trendProducts, products, userLogged })
}
//logout 
const handlePostLogout = (req, res, next) => {

    req.logout(function (err) {
        if (err) { return next(err); }
        req.flash('success', "Logout Successful!")
        req.session.isAuth = false;
        res.redirect('/')
    });



}

const handleGetVerify = (req, res) => {
    const userId = req.query.id;

    const userLogged = req.session.isAuth;
    let otp_val_failed = false;
    if (req.session.invalidotp == 'invalidOTP') {
        otp_val_failed = true;
    }
    const alert = req.flash('alert')
    res.render('otp', { title: 'login', userId, userLogged, alert, otp_val_failed })
}
//verify with otp 
const handlePostVerify = async (req, res) => {
    const id = req.params.id
    const tokenCollection = await token.findOne({ user_id: req.params.id })
    const enteredOtp = req.body.otp;
    const compareOtp = await bcrypt.compare(enteredOtp, tokenCollection.otp)

    const currentTime = function () {
        if (Date.now() < tokenCollection.expiresAt) {
            return true;
        } else {
            return false
        }
    }
    console.log(currentTime())
    try {
        if (compareOtp && currentTime()) {
            await userCollection.findOneAndUpdate({ _id: req.params.id }, { isVerified: true })
            console.log('email verification successful');
            req.flash('success', 'User account created successfully')
            // res.redirect('/login')
            res.json('success')
        } else if (!compareOtp) {
            console.log('entered OTP is wrong')
            req.flash('alert', "Invalid OTP")
            req.session.invalidotp = 'invalidOTP'
            // res.redirect('/verify?id='+id)
            res.json('Invalid OTP')

        } else {
            console.log('entered OTP is expired')
            req.flash('alert', "OTP expired, press resend OTP")
            // res.redirect('/verify?id='+id)
            res.json('OTP expired')
        }
    } catch (error) {
        console.log(error)
    }
}
//resend otp 
const handlePostResendOtp = async (req, res) => {
    console.log('resend')
    const user = await userCollection.findById(req.params.id);
    const fetchToken = await token.findOne({ user_id: req.params.id })

    await sendVerifyMail(user.name, user.email, user._id, res);
}

//handle forgot password
const handleGetforgotPass = (req, res) => {
    const userLogged = req.session.isAuth;
    const alert = req.flash('alert')
    res.render('forgot-password-email', { title: "forgot password", userLogged, alert })
}
const handlePostEmail = async (req, res) => {
    const email = req.body.email;
    try {
        const checkUserPresent = await userCollection.findOne({ email: email })
        if (!checkUserPresent) {
            console.log('Email address not found');
            req.flash('alert', 'Entered email address not registered')
            res.redirect('/forgot-password')
        } else {
            await sendResetPassMail(checkUserPresent.name, checkUserPresent.email, checkUserPresent._id, res);
            res.redirect('/forgot-password-otp?id=' + checkUserPresent._id)
        }

    } catch (error) {
        console.log(error)
    }

}
const handleGetForgotOtp = (req, res) => {
    const userId = req.query.id;
    const userLogged = req.session.isAuth;
    const alert = req.flash('alert')
    res.render('forgot-password-otp', { title: "otp verification", userLogged, userId, alert })
}

const handlePostForgotOtp = async (req, res) => {
    const id = req.params.id;
    const tokenCollection = await token.findOne({ user_id: req.params.id })
    const enteredOtp = req.body.otp;
    const compareOtp = await bcrypt.compare(enteredOtp, tokenCollection.otp)

    const currentTime = function () {
        if (Date.now() < tokenCollection.expiresAt) {
            return true;
        } else {
            return false
        }
    }
    console.log(currentTime())
    try {
        if (compareOtp && currentTime()) {
            await userCollection.findOneAndUpdate({ _id: req.params.id }, { isVerified: true })
            console.log('otp verification successful');
            req.flash('success', 'Otp verification successful!')
            res.redirect('/forgot-resetpassword?id=' + id)
        } else if (!compareOtp) {
            console.log('entered OTP is wrong')
            req.flash('alert', "Invalid OTP")
            res.redirect('/forgot-password-otp?id=' + id)

        } else {
            console.log('entered OTP is expired')
            req.flash('alert', "OTP expired, press resend OTP")
            res.redirect('/forgot-password-otp?id=' + id)
        }
    } catch (error) {
        console.log(error)
    }
}

const handleGetForgotPassReset = (req, res) => {
    const userLogged = req.session.isAuth;
    const userId = req.query.id;
    const success = req.flash('success');
    const alert = req.flash('alert')
    res.render('forgot-resetpassword', { title: 'Reset password', userLogged, userId, success, alert })
}

const handlePostForgotPassReset = async (req, res) => {
    try {
        const { newPassword, confirmPassword } = req.body;
        const user = await userCollection.findById(req.params.id);
        if (!user) {
            console.log('user not found')
            res.redirect('/forgot/password')
        } else {
            if (newPassword != confirmPassword) {
                console.log('password missmatch')
                req.flash('alert', 'password mismatch')
                res.redirect('/forgot-resetpassword?id=' + req.params.id)
            } else {
                const hashNewPass = await bcrypt.hash(newPassword, 10);
                await userCollection.findByIdAndUpdate(req.params.id, { password: hashNewPass }, { upsert: true });
                console.log('password changed');
                req.flash('success', 'password changed successfully')
                res.redirect('/login')

            }
        }

    } catch (error) {
        console.log(error)
    }
}


module.exports = {
    handlerGetSignup,
    handlePostSignup,
    handleGetLogin,
    handlePostLogin,
    handleGetHome,
    handlePostLogout,
    handleGetVerify,
    handlePostVerify,
    handlePostResendOtp,
    handleGetforgotPass,
    handlePostEmail,
    handleGetForgotOtp,
    handlePostForgotOtp,
    handleGetForgotPassReset,
    handlePostForgotPassReset
}