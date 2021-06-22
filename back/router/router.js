const express = require('express')
const router = express()
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
var randomstring = require("randomstring");
const writeToLog = require('../logger');
const { connectLogger } = require('log4js');
const User = require('../models/User');
const fetch= require('node-fetch');



const nodemailer = require("nodemailer");
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
        let check = req.user.split(' ')
        let errType="";
        console.log("CHECK [0] ", check[0])
        if(check[0]==="Email"){errType="email"}
        if(check[0]==="Username"){errType="username"}
        writeToLog("User signup err (taken) : " + req.user)

        res.json({
            ok:0,
            type:errType,
            err:req.user,
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
              console.log("Login call");
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
        console.log("ERROR : ", req.user)
        res.json({
            ok:0,
            msg:req.user,
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
          if (err || !user || user.isAdmin === false) {
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



router.post('/reset?', async(req, res, next)=>{
  let token = req.query.token;
  let body = req.body;
  console.log("token is : ", token)
  console.log("body id : ", body)
 
  let found = await User.findOne({resetPassToken:token.toString()});
  console.log('found is ', found)
  if(found){
    //allow password change
    if (Object.keys(req.body).length === 0) {
      res.json({ok:1, msg:"Password reset allowed"})
      return
   }

   let pass = body.password;
   let confirm = body.confirm;
   if(pass === confirm){
    let hash = await bcrypt.hash(pass, bcrypt.genSaltSync(10));
    await User.findOneAndUpdate({_id:found._id},{password:hash, resetPassToken: null});
    res.json({ok:1, msg:"Password changed successfully"})
    return;
   }else {
    res.json({ok:0, err:"Passwords do not match"})
    return;
   }
  }else {
    res.json({ok:0, err:"Token not found"})
    return
  }
})






router.post('/forgot', async(req, res, next)=>{
  let email = req.body.email;
  let found = await User.findOne({email:email});
  if(found){
    let token = randomstring.generate(50);
   // console.log("newpass is : ", newPass);
   // let hash = await bcrypt.hash(newPass, bcrypt.genSaltSync(10));
   // console.log("passhash : ", hash)
    await User.findOneAndUpdate({_id:found._id}, {resetPassToken:token})
    mailer(email, token);
  }
res.json({ok:1, msg:"Password reset"})

})





async function mailer(email, token) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
 // let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'briana.sauer69@ethereal.email',
        pass: 'YB9MF2JXfszE7mmTJK'
    }
});
let variable = "<a href=\"http://localhost:3000/reset?token="+token+"\"></a>";
  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"ctGuard Administrator" <administrator@ctGuard.com>', // sender address
    to: email, // list of receivers
    subject: "Password Reset", // Subject line
    text: `Hello, the link to reset your password is http://localhost:3000/forgot/${token}`, // plain text body
    html: `Hello, the link to reset your password is http://localhost:3000/forgot/${token}`, // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}










  module.exports=router