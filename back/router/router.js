const express = require('express')
const router = express()
const passport = require('passport');
const jwt = require('jsonwebtoken');
const writeToLog = require('../logger');
const { connectLogger } = require('log4js');
const User = require('../models/User');
const fetch= require('node-fetch')
router.get('/', (req, res, next)=>{
    res.json('hello world')
  })


router.post('/fb',
 passport.authenticate('fb', {session:false}), async(req, res, next)=>{
 let uid= req.user._id;
 let body = {_id : uid}
 if(uid!== undefined && uid!== null && uid !==""){
    const token = jwt.sign({ user: body }, 'TOP_SECRET', {expiresIn:'24h'});
    res.json({ok:1, "token":token})
 }else {
   res.json({ok:0, error:"problems with fb login"})
 }
 })
  


  router.post(
    '/signup',
    passport.authenticate('signup', { session: false }),
    async (req, res, next) => {
        //ok=1, all good, signup success
        //ok=0, not good, signup not successfull
        //return error what is broken
       
        if(typeof req.user === "object"){
            writeToLog("User signup successful : " + req.user.username)
            let user= {username:req.user.username, email : req.user.email}
      res.json({
        ok:1,
        user: user
      });}else {
        writeToLog("User signup err (taken) : " + req.user)
        res.json({
            ok:0,
            user:req.user,
        })
      }
    }
  );

 


/* GETS ALL USER DATA ON LOGIN AND SIGNS AN JWT TOKEN */
router.post(
    '/login',
    async (req, res, next) => {
      passport.authenticate(
        'login',
        async (err, user, info) => {
          try {
              console.log('this is the user : ', user)
            if (err || !user) {
              const error = new Error('An error occurred.');
              res.json({ok:0, msg:"Email or password incorrect"})
              return next(error);
            }
            req.login(
              user,
              { session: false },
              async (error) => {
                if (error) return next(error);
                const body = { _id: user._id};
                const token = jwt.sign({ user: body }, 'TOP_SECRET', {expiresIn:'24h'});
                return res.json({ "token":token , "user": body});
              }
            );
          } catch (error) {
            return next(error);
          }
        }
      )(req, res, next);
    }
  );

/**
 * Register and login admin with special provided token
 */
  router.post(
    '/adminReg',
    passport.authenticate('adminReg', { session: false }),
    async (req, res, next) => {
        //ok=1, all good, signup success
        //ok=0, not good, signup not successfull
        //return error what is broken
       
        if(typeof req.user === "object"){
            writeToLog("User signup successful : " + req.user.username)
            let user= {username:req.user.username, email : req.user.email}
      res.json({
        ok:1,
        user: user
      });}else {
        writeToLog("User signup err (taken) : " + req.user)
        res.json({
            ok:0,
            user:req.user,
        })
      }
    }
  );

/* GETS ALL USER DATA ON LOGIN AND SIGNS AN JWT TOKEN */
router.post(
  '/adminLog',
  async (req, res, next) => {
    passport.authenticate(
      'adminLog',
      async (err, user, info) => {
        try {
            console.log('this is the user : ', user)
          if (err || !user) {
            const error = new Error('An error occurred.');
            res.json({ok:0, msg:"Email or password incorrect"})
            return next(error);
          }
          req.login(
            user,
            { session: false },
            async (error) => {
              if (error) return next(error);
              console.log("IS ADMIn", user.isAdmin)
              const body = { _id: user._id, isAdmin:user.isAdmin};
              const token = jwt.sign({ user: body }, 'TOP_SECRET', {expiresIn:'24h'});
              return res.json({ "token":token , "user": body});
            }
          );
        } catch (error) {
          return next(error);
        }
      }
    )(req, res, next);
  }
);

  module.exports=router