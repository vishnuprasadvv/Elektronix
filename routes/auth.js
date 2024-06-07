const router= require('express').Router();
const passport= require('passport');
const {handleGetLogin,handleGetHome}= require('../controllers/user/userController')

// Route to initiate Google Sign-in
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback route after Google Sign-in
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  // Successful authentication, redirect to your application's main page
  res.redirect('/home');
});

// 
// router.get('/home', ensureAuthenticated,handleGetHome);

// function ensureAuthenticated(req, res, next) {
//   if (req.isAuthenticated()) {
//     req.session.isAuth = true;
//     req.session.user = req.user._id;
    
//     return next();
//   }
//   console.log('not authenticated')
//   res.redirect('/login');
// }

router.post('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      req.session.destroy();
      res.redirect('/login');
    });
  });
module.exports= router;