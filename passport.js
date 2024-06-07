const GoogleStrategy  = require("passport-google-oauth20").Strategy;
const passport = require('passport');
const UserCollection = require('./models/user')
const bcrypt= require('bcrypt')
passport.use(
    new GoogleStrategy({
        clientID:process.env.CLIENT_ID,
        clientSecret:process.env.CLIENT_SECRET,
        callbackURL:"http://localhost:5000/auth/google/callback",
        scope:['profile','email']
    },
    (accessToken, refreshToken, profile, done) => {
        // Logic to find or create user based on profile data (replace with your implementation)
        //console.log('Google profile:', profile);
      
        // Assuming you have a User model with email as a unique identifier
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