const GoogleStrategy  = require("passport-google-oauth20").Strategy;
const passport = require('passport');
const UserCollection = require('./models/user')
const bcrypt= require('bcrypt')
passport.use(
    new GoogleStrategy({
        clientID:process.env.CLIENT_ID,
        clientSecret:process.env.CLIENT_SECRET,
        callbackURL:"https://elektronix.co.in/auth/google/callback",
        scope:['profile','email']
    },
    (accessToken, refreshToken, profile, done) => {
        UserCollection.findOne({ email: profile.emails[0].value }).then(existingUser => {
          if (existingUser) {
            console.log('already present')
            return done(null, existingUser); // User already exists
          } else {
            // Create a new user
            const newUser = new UserCollection({ 
              name: profile.displayName,
              email: profile.emails[0].value,
              
              // Add other user properties as needed
            });
            return newUser.save().then(user => done(null, user));
          }
        }).catch(err => done(err));
      }));
      
      // Serialization and deserialization for user sessions
      passport.serializeUser((user, done) => {
        done(null, user.id);
      });
      
      passport.deserializeUser((id, done) => {
        UserCollection.findById(id).then(user => done(null, user)).catch(err => done(err));
      });