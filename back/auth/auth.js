const { response } = require('express');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;

const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

const jwt = require('jsonwebtoken');
const FacebookStrategy = require('passport-facebook').Strategy;
/**
 * Models
 */
const User = require('../models/User');
const NotificationsQ= require('../models/notificationQueue');
const AdminTokens= require('../models/AdminTokens');
const Achivements = require('../models/Achivements');
/**
 * Bcrypt for hashing
 */
const bcrypt = require('bcrypt')
var randomstring = require("randomstring");

const fetch= require('node-fetch')




passport.use(
  new JWTstrategy(
    {
      secretOrKey: 'TOP_SECRET',
     jwtFromRequest: ExtractJWT.fromHeader('token')
    },
    async (token, done) => {
      try {
        return done(null, token.user);
      } catch (error) {
        done(error);
      }
    }
  )
);
passport.use('admin',
  new JWTstrategy(
    {
      secretOrKey: 'TOP_SECRET',
     jwtFromRequest: ExtractJWT.fromHeader('token')
    },
    async (token, done) => {
      try {
        return done(null, token.user);
      } catch (error) {
        done(error);
      }
    }
  )
);


/**
 * Admin Register Strategy
 */

passport.use(
  'adminReg',
  new localStrategy(
    {
      emailField: 'email',
      passwordField: 'password',
      confirmField: 'confirm',
      usernameField:'username',
      passReqToCallback:true
    },
    async (req, email, password, done) => {
        let em=req.body.email;
        let pass=req.body.password;
        let confirm=req.body.confirm;
        let usrname=req.body.username;
        let firstName = req.body.firstName;
        let lastName = req.body.lastName;
        let country = req.body.country;
        let region = req.body.region;
        let functionTxt = req.body.functionTxt;
        let token = req.body.token;
        if(pass==confirm){
      try {
        /**
         * check if user exists
         */
        console.log("**********ADMIN REGISTER *******************")
      
        let msg="Unknown Err";
        let found = await User.findOne({username:usrname});
          if(found === null){
              //new user
              let emailCheckFast = await User.findOne({email:em})
              if(emailCheckFast!== null){
                  let user = "email"
                  return done(null, user)
              }
              /**
               * If user doesn't exist, check token validity
               */
              let tokCheck = await AdminTokens.findOne({token:token});
              
              if(tokCheck && (Date.now() < tokCheck.validUntil)){
              let passHash = await bcrypt.hash(pass, bcrypt.genSaltSync(10));
             await  User.create({username:usrname, email: em, password : passHash, isAdmin:true, firstName:firstName, lastName:lastName, country:country, region:region, functionTxt:functionTxt, anon:false, anonFlag:false})
              await AdminTokens.remove({token:token})
             let user = await User.findOne({username:usrname})
             await NotificationsQ.create({user_id:user._id.toString(), rooms:{}, comments:{}})
             let achiv = await Achivements.find().lean();
             let reg = achiv[0];
             achiv.reverse();
             let trusted = achiv[1];
             let auth = achiv[0];
             await User.update({_id:user._id.toString()}, {$addToSet:{achivements:reg._id.toString()}})
             await User.update({_id:user._id.toString()}, {$addToSet:{achivements:trusted._id.toString()}})
             await User.update({_id:user._id.toString()}, {$addToSet:{achivements:auth._id.toString()}})
              return done(null, user)
              }else {
                return(done(null, 'token'))
              }
          }else {
             let usercheck= await User.findOne({username:usrname});
             if(usercheck!== null){
              user= 'username';
              return done(null, user)
             }

             msg=-3;
             return done(null, user)
          }
        }
           catch (error) {
        done(error);
      }
    } 
  }
  )
);



/**
 * Facebook strategy
 */
passport.use(
  'fb',
  new localStrategy(
    {
      usernameField:'email',
      passwordField:'accessToken',
      nameField:'name',
      idField:'id',
      passReqToCallback:true
    },
    async (req,email, password, done) => {
        let body= await req.body
       let accessToken = await req.body.accessToken;
      try {
        let url="https://graph.facebook.com/v2.8/me?access_token="+accessToken;
        let responseRaw = await fetch(url);
        let response= await responseRaw.json()
           let error=response.error;
           let userInfo;
           if(error===undefined){
            if(response && body.email !== undefined && body.email !== null && body.email!== ""){
              let found = await User.findOne({email:body.email});
              if(found){
                //return user info
                  return done(null, found)
              }else {
              //create account and save data
              let name = response.name.split(' ');
              let firstname, lastname;
              firstname= name[0];lastname=name[1];
                let user = await User.create({email:body.email, firstName:firstname, lastName:lastname, username:body.id, password:await bcrypt.hash(randomstring.generate(10), 10)})
                await NotificationsQ.create({user_id:user._id.toString()})
                return done(null, user)
              }
            }
      
          }else {
            let user=null;
            return done(null, user)
          }

        }
           catch (error) {
        done(null, null);
      }
    } 
  
  )
);






/**
 * Sign up strategy
 */
passport.use(
    'signup',
    new localStrategy(
      {
        emailField: 'email',
        passwordField: 'password',
        confirmField: 'confirm',
        usernameField:'username',
        passReqToCallback:true
      },
      async (req, email, password, done) => {
          let em=req.body.email.toString().length>50?req.body.email.toString().slice(0, 50):req.body.email.toString();
          let pass=req.body.password.toString().length>25?req.body.password.toString().slice(0, 25):req.body.password.toString();
          let confirm=req.body.confirm;
          let usrname=req.body.username.toString().length>15?req.body.username.toString().slice(0, 15):req.body.username.toString();
          if(pass==confirm){
        try {
          /**
           * check if user exists
           */
          let msg="Unknown Err";
          let found = await User.findOne({username:usrname});
            if(found === null){
                //new user
                let emailCheckFast = await User.findOne({email:em})
                if(emailCheckFast!== null){
                    let user = "Email already taken"
                    return done(null, user)
                }
                let defaultAvatar = "default.jpg";
                let passHash = await bcrypt.hash(pass, bcrypt.genSaltSync(10));
                let regToken = randomstring.generate(50);
               await  User.create({username:usrname, email: em, password : passHash, avatarUrl:defaultAvatar, darkTheme:false, registrationToken:regToken, confirmed:false})
               let user = await User.findOne({username:usrname})
               await NotificationsQ.create({user_id:user._id.toString(), rooms:{}, comments:{}})
               let achiv = await Achivements.find();
                let registrationAchivement = achiv[0];
                await User.update({_id:user._id.toString()}, {$addToSet:{achivements:registrationAchivement._id.toString()}})
                return done(null, user)
            }else {
               let usercheck= await User.findOne({username:usrname});
               if(usercheck!== null){
                user= 'Username already taken';
                return done(null, user)
               }

               msg=-3;
               return done(null, user)
            }
          }
             catch (error) {
          done(error);
        }
      } 
    }
    )
  );

/**
 * Login Strategy
 */

  passport.use(
    'login',
    new localStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback:true
      },
      async (req, email, password, done) => {

        try {
            let email=req.body.email;
            let password= req.body.password.toString();

            let user =await User.findOne({email:email})

          if (!user) {
            return done(null, false, { message: 'Email or password incorrect' });
          }
          let validate = await bcrypt.compare(password, user.password)

          if (!validate) {
               return done(null, false, { message: 'Email or password incorrect' });
          }
          if(!user.confirmed){
            return done(null, false, { message: 'Email address not confirmed' });
          }
          

          return done(null, user, { message: 'Logged in Successfully' });
        } catch (error) {
          return done(error);
        }
      }
    )
  );

/**
 * Login Strategy for Administrator
 */

passport.use(
  'adminLog',
  new localStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback:true
    },
    async (req, email, password, done) => {

      try {
          let email=req.body.email;
          let password= req.body.password.toString();

          let user =await User.findOne({email:email})
         
        if (!user) {
          return done(null, false, { message: 'User not found' });
        }
        
        let validate = await bcrypt.compare(password, user.password)

        if (!validate && (user.isAdmin)) {
             return done(null, false, { message: 'Wrong Password' });
        }
        
        return done(null, user, { message: 'Logged in Successfully' });
      } catch (error) {
        return done(error);
      }
    }
  )
);




