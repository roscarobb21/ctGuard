const express = require('express')
const router = express()
var multer  = require('multer')
var crypto = require('crypto')
var path= require('path')
const User = require('../models/User');
const Posts= require('../models/Posts');
var storage = multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
    console.log('req is ', req.user)
    cb(null, req.user._id+'.png')
    }
  })
  var upload = multer({ dest: 'uploads/' , storage:storage})

router.get('/', async (req, res, next) => {
    let id = req.user._id;
    let user = await User.findOne({_id:id})
    console.log('/api USER IS ', user)
    let newUser = {id:user._id, email:user.email, avatarUrl:user.avatarUrl, username:user.username, liked :user.liked, following: user.following}
    if(user){
        res.json({ok:1, user:newUser})
    }
    else {
        res.json({ok:0})
    }
});

router.get('/posts', async(req, res, next)=>{
let id = req.user._id;
let user = await User.findOne({_id:id});
let usrPost = await Posts.find({postedBy:user._id});
console.log('ok ', usrPost)
if(usrPost){
    res.json({ok:1, posts:usrPost})
}else {
    res.json({ok:0, err:"You don't have any posts"})
}
})

router.post('/profileAvatar', upload.single('avatar'), async function (req, res, next) {
    let user = req.user;
    let file = req.file;
    if(file){
        let found = await User.updateOne({_id:user._id}, {avatarUrl: "http://localhost:5000/"+user._id+".png"});
        res.json({ok:1});
    }else {
        res.json({ok:0})
    }
  })




module.exports=router;