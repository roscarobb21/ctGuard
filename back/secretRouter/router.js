const express = require('express')
const router = express()
var multer  = require('multer')
var crypto = require('crypto')
var path= require('path')
const User = require('../models/User');
const Posts= require('../models/Posts');
const ChatRooms= require('../models/Chat');
const openGeocoder = require('node-open-geocoder');
const { random } = require('faker')
const { post, route } = require('../router/router')
const { ObjectId, ObjectID } = require('mongodb');

const { runInNewContext } = require('vm')
const fetch = require('node-fetch');
const NotificationQ = require('../models/notificationQueue')
const DeAnonQueue = require('../models/DeAnonQueue')
const Popular = require('../models/Popular');
const bcrypt = require('bcrypt')
var mv = require('mv');
var fs = require('fs');
const Jimp = require('jimp');
var convert = require('xml-js');
/**
 * Extracts mentions and hashtags from a string
 */
const extract = require('mention-hashtag')

const {spawn} = require('child_process');

const {PythonShell} =require('python-shell'); 
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants')
const { async } = require('crypto-random-string')
const Achivements = require('../models/Achivements')

var _ = require('lodash');
const { checkAndMakeDir } = require('express-fileupload/lib/utilities')
const notificationQueue = require('../models/notificationQueue')
const News = require('../models/News')


router.get('/myid', async(req, res, next)=>{
    let id = req.user._id;
    let found = await User.findOne({_id:id});
    if(found){
        res.json({ok:1, myID: found._id, avatarUrl:found.avatarUrl, username:found.username});
        return

    }else {
        res.json({ok:0, err:"User not found"})
        return;
    }
})


router.post('/online', async(req, res, next)=>{
    let uid = req.user._id;
    let found = await User.findOne({_id:uid})
    if(found){
        await User.findOneAndUpdate({_id:uid}, {latestActive:Date.now()})
        console.log("User ", uid , " is online!")
        res.json({ok:1, msg:"User updated Online"})
        return
    }else {
        res.json({ok:0, err:"User not found"})
        return
    }
})



/**
 * localhost:{port}/api GET USER INFO
 */

 router.get('/', async (req, res, next) => {
    let id = req.user._id;
    let user = await User.findOne({_id:id})
    if(user === null){
        res.json({ok:0, err:"User not found"})
        return
    }
    
    let achiv = await Achivements.find({_id:user.achivements});
    let orderedAchiv = []
    achiv.forEach(element => {
        if(element.media[0] === "policeman.jpg" || element.media[0] === "security.jpg" || element.media[0] === "trust.jpg"){
            orderedAchiv.unshift(element);
        }else {
            orderedAchiv.push(element);
        }
    });
   // console.log('achivs are : ', achiv)
   let notif = await notificationQueue.findOne({user_id:user._id});
   
   let news = notif.news
   let newsText;
   let newsView
   if(news.length === 0){
       newsText = "";
       newsView = "";
   }else {
    newsText = await News.findOne({_id:news[news.length-1].news_id})

    newsView = news[news.length-1];
 
   }
    let newUser = {anonFlag: user.anon, pendingAnon:user.pendingAnon, id:user._id, email:user.email, avatarUrl:user.avatarUrl, username:user.username, liked :user.liked, following: user.following, country: user.country, region: user.region, upVoted:user.upVoted, feed:user.feed, isAdmin:user.isAdmin, showcase:orderedAchiv, darkTheme:user.darkTheme, bio:user.bio, newsview:newsView, newstext:newsText}
    if(user){
        res.json({ok:1, user:newUser})
    }
    else {
        res.json({ok:0})
    }
});


/**
 * Change user BIO
 */
router.post('/change_bio', async(req, res, next)=>{
    let uid = req.user._id;
    let bio = req.body.bio.toString();
    bio = bio.length> 250?bio.substring(0, 250):bio;
    bio = bio.trim()
    let found = await User.findOne({_id:uid});
    if(found){
        await User.updateOne({_id:uid}, {bio:bio})
        res.json({ok:1, msg:"Bio updated!"})
        return;
    }else {
        res.json({ok:0, err:"User not found"});
        return
    }
})

/**
 * Set user preffered theme
 */
router.get('/change_theme', async(req, res, next)=>{
    let uid = req.user._id;
    let found = await User.findOne({_id:uid});
    console.log("🚀 ~ file: router.js ~ line 88 ~ router.get ~ found", found)
    if(found){
        await User.updateOne({_id:uid}, {darkTheme:!found.darkTheme})
        res.json({ok:1})
        return
    }
    res.json({ok:0})
    return
})
router.post('/change_timeline', async(req, res, next)=>{
    let uid = req.user._id;
    let timeline = req.body.timeline.toString() === "true"?true:false;
    console.log("🚀 ~ file: router.js ~ line 100 ~ router.post ~ timeline", timeline)
    let found = await User.findOne({_id:uid})
    if(found){
        await User.updateOne({_id:uid}, {feed:timeline})
        res.json({ok:1})
        return
    }else {
        res.json({ok:0, err:"User not found"})
        return
    }
})

/**
 * Return user country and county from 
 * latitude and longitude
 */

router.get('/location?', async(req, res, next)=>{
    let lat = req.query.lat;
    let lon = req.query.lon;
    
    let link = "https://nominatim.openstreetmap.org/reverse?lat="+lat+"&lon="+lon;
    let responseRaw = await fetch(link);
    let responseXML = await responseRaw.text()
    let responseJSON = convert.xml2json(responseXML, {compact: true, spaces: 4});
    let format = await JSON.parse(responseJSON)

    let uid = req.user._id;
    lat = lat.length > 9? lat.substring(0, 9):lat
    lon = lon.length > 9? lon.substring(0, 9):lon
    await User.findOneAndUpdate({_id:uid}, {lat:lat, long:lon})

    res.json({ok:1, address:{country:format.reversegeocode.addressparts.country._text, county:format.reversegeocode.addressparts.county._text}})
    })


  router.post('/deanonmedia',  async function (req, res, next) {
    console.log("********* DE ANON MEDIA *******")
    let id = req.user._id;
    let file = req.files.avatar;
    console.log("🚀 ~ file: router.js ~ line 106 ~ file", file)
    let name = crypto.randomBytes(15).toString('hex');
    let finalPath = __dirname+'\\..\\deAnonUploads\\';
    let uploadPath = __dirname+'\\..\\tmpUploads\\';
    let tmppath = uploadPath;
   
    if (!fs.existsSync(uploadPath)){
        fs.mkdirSync(uploadPath);
    }
    if (!fs.existsSync(finalPath)){
        fs.mkdirSync(finalPath);
    }

    tmppath+=name;
    tmppath+='.jpg';

    file.mv(tmppath, async function(err) {
        Jimp.read(tmppath, function(err, img){
            //let sizes = [128, 256, 512, 1080];
            let sizes = [1080, 512, 256, 128];
            let quality = 100;
            let path = finalPath;
             // resize for all sizes
             sizes.forEach(function (size) {
                 // resize, and save to the build folder
                 img.scaleToFit(size, Jimp.AUTO, Jimp.RESIZE_BEZIER)
                 .quality(100)
                 .write('./deAnonUploads/'+size+'/'+'__'+size+'__'+name+'.jpg'); // save
             });
        })
        
         });
         await DeAnonQueue.findOneAndUpdate({user_id:id}, {mediaFile:name+'.jpg'})
         res.json({ok:1})

  })

  router.post('/postmedia',  async function (req, res, next) {
    let uploadPath = __dirname+'\\..\\tmpUploads\\';
    let finalPath  = __dirname+'\\..\\postUploads\\';

    let io = req.app.get('socketio');
   

    let user = req.user;
    let body = req.body;
    let pid = req.query.postId.toString();
    let reqFiles;
    if(req.files === null){
        reqFiles=[]
       // io.to(user._id.toString()).emit("no_post_media")
        res.json({ok:1})
    }else {
        reqFiles = req.files.image;
       // io.to(user._id.toString()).emit("finish_upload")
        res.json({ok:1})
    }

    let files = [].concat(reqFiles);
    var links = []
    
 
   
    if (!fs.existsSync(uploadPath)){
        fs.mkdirSync(uploadPath);
    }
    
    

    files.forEach( async (file)=> {
        let name;
        name = crypto.randomBytes(15).toString('hex');
        let ext = file.mimetype.split('/')[0];
        let tmppath = uploadPath;
        let finalPathFile = finalPath;

        tmppath+=name;
        tmppath+=ext=='video'?'.mp4':'.jpg';
        let link = name;
        link+=ext==='video'?'.mp4':'.jpg'
        links.push(link)
       
        if(ext !== 'video'){
        file.mv(tmppath,async function(err) {
           Jimp.read(tmppath, function(err, img){
              // let sizes = [360, 720, 1080];
               
               let sizes = [1080, 720, 360];
               let quality = 10;
               let path = finalPathFile;
                // resize for all sizes
                sizes.forEach(function (size) {
                    // resize, and save to the build folder
                    img.scaleToFit(size, Jimp.AUTO, Jimp.RESIZE_BEZIER)
                    .quality(100)
                    .write('./postMedia/'+size+'/'+'__'+size+'__'+name+'.jpg'); // save
                });
           })
            });

        }else {
            file.mv( './tmpUploads/TMP'+name+'.mp4' , async function(err){})

            console.log("Python Script Started !")
            
            let options360 = { 
                mode: 'text', 
                pythonOptions: ['-u'], // get print results in real-time 
                scriptPath: 'secretRouter',
                args: ["\\tmpUploads\\TMP"+name+'.mp4', '\\postMedia\\360\\__360__'+name+'.mp4', '360p'] //An argument which can be accessed in the script using sys.argv[1] 
            }; 
            PythonShell.run('./videoResize.py', options360, function (err, result){ 
                if (err) throw err; 
              //Collect python result from result.toString()
           }); 
           let options720 = { 
            mode: 'text', 
            pythonOptions: ['-u'], // get print results in real-time 
            scriptPath: 'secretRouter',
            args: ["\\tmpUploads\\TMP"+name+'.mp4', '\\postMedia\\720\\__720__'+name+'.mp4', '720p'] //An argument which can be accessed in the script using sys.argv[1] 
        }; 
        PythonShell.run('./videoResize.py', options720, function (err, result){ 
            if (err) throw err; 
            //Collect python result from result.toString()
       }); 
       let options1080 = { 
        mode: 'text', 
        pythonOptions: ['-u'], // get print results in real-time 
        scriptPath: 'secretRouter',
        args: ["\\tmpUploads\\TMP"+name+'.mp4', '\\postMedia\\1080\\__1080__'+name+'.mp4', '1080p'] //An argument which can be accessed in the script using sys.argv[1] 
    }; 
    PythonShell.run('./videoResize.py', options1080, function (err, result){ 
        if (err) throw err; 
        //Collect python result from result.toString()
   }); 
        let unlinkExt = ext=='video'?'.mp4':'.jpg';
        //TODO
        //DELETE TEMPORARY FILES FROM TMP FOLDER
        }
    });
  await Posts.findOneAndUpdate({_id:pid}, {media:links})
  await res.json({ok:1})
  return;
  })

  router.post('/profileAvatar', async function (req, res, next) {
    let user = req.user;
    let uid = req.user._id;
    let avatar = req.files.avatar;
    let name = crypto.randomBytes(15).toString('hex');
    let finalPath = __dirname+'\\..\\avatarUploads\\';
    let uploadPath = __dirname+'\\..\\tmpUploads\\';
    let tmppath = uploadPath;
   
    if (!fs.existsSync(uploadPath)){
        fs.mkdirSync(uploadPath);
    }
    if (!fs.existsSync(finalPath)){
        fs.mkdirSync(finalPath);
    }

    tmppath+=name;
    tmppath+='.jpg';

    avatar.mv(tmppath, async function(err) {
        Jimp.read(tmppath, function(err, img){
           // let sizes = [128, 256, 512, 1080];
            let sizes = [1080, 512, 256, 128];
            let quality = 100;
            let path = finalPath;
             // resize for all sizes
             sizes.forEach(function (size) {
                 // resize, and save to the build folder
                 img.scaleToFit(size, Jimp.AUTO, Jimp.RESIZE_BEZIER)
                 .quality(100)
                 .write('./avatarUploads/'+size+'/'+'__'+size+'__'+name+'.jpg'); // save
             });
        })
        
         });
         let avatarUrl = name+'.jpg';

   let found =  await User.findOneAndUpdate({_id:uid}, {avatarUrl:avatarUrl})
    await ChatRooms.update({secondUsername:found.username},{secondAvatarUrl:avatarUrl})
    
    await ChatRooms.update({firstUsername:found.username},{firstAvatarUrl:avatarUrl})

         res.json({ok:1})
  })





/**
 * Route to change user password to a new one
 */

 router.post('/changePass', async (req, res, next)=>{
    let uid = req.user._id;
    let oldPass = req.body.oldPass;
    let newPass = req.body.newPass;
    let confirm = req.body.confirm;

    let found = await User.findOne({_id:uid});
    if(found){
        if(newPass === confirm && await bcrypt.compare(oldPass, found.password)){
            let verification = await bcrypt.compare(newPass, found.password)
            if(verification){
                res.json({ok:0, err:'New password can\'t match previous'})
            }else {
                let passHash = await bcrypt.hash(newPass, 10);
                await User.updateOne({_id:uid}, {password : passHash});
                res.json({ok:1, msg:'Password changed successfull'})
                return
            }
        }else {
            console.log('dontchange ')
            res.json({ok:0, err:'Information provided not correct'})
            return;
        }
    }else {
        res.json({ok:0, err:'user not found'})
        return;
    }

 })
 /**
  * Change user info route 
  */
 router.post('/changeInfo', async (req, res, next)=>{
     let uid = req.user._id;
     let email = req.body.email.length>0?req.body.email:"NOCHANGE";
     let username = req.body.username.length>0?req.body.username:"NOCHANGE";
     let country = req.body.country !== null? req.body.country:"Romania";
     let region = req.body.region
     let found = await User.findOne({_id:uid});
     if( found ){
         if(email !== "NOCHANGE"){
        await User.updateOne({_id:found._id}, {
            email:email,
        })
    }
    if(username !== "NOCHANGE"){
        await User.updateOne({_id:found._id}, {
            username:username,
        })
    }
    if(country !== "NOCHANGE"){
        await User.updateOne({_id:found._id}, {
            country:country,
        })
    }
    if(region !== "NOCHANGE"){
        await User.updateOne({_id:found._id}, {
            region:region,
        })
    }
res.json({ok:1, msg:'Info updated !'})
return
        
     }else {
         res.json({ok:0, err:'User not found'})
     }
 })

/**
 * Get stranger user info
 */
router.get('/user?', async (req, res, next)=>{
    let id = req.query.id.toString();
    let requestuid = req.user._id;
    let user = await User.findOne({_id:id});
    let myUser = await User.findOne({_id:requestuid});
    if(user._id.toString()  === myUser._id.toString()){
        res.json({ok:3, msg:"Same user, redirect to /profile"}).redirect('/profile')
        return;
    }
    let posts;
    let newUserInfo={};
    if(user){
        let achiv = await Achivements.find({_id:user.achivements});
        let orderedAchiv = []
        achiv.forEach(element => {
            if(element.media[0] === "policeman.jpg" || element.media[0] === "security.jpg" || element.media[0] === "trust.jpg"){
                orderedAchiv.unshift(element);
            }else {
                orderedAchiv.push(element);
            }
        });

        newUserInfo.avatarUrl=user.avatarUrl;
        newUserInfo.username= user.username;
        newUserInfo.showcase= orderedAchiv;
        newUserInfo.postPoints = user.postPoints;
        newUserInfo.anon = user.anon;
        if(user.anon === false){
            newUserInfo.firstName = user.firstName;
            newUserInfo.lastName = user.lastName;
        }
        if(user.isAdmin === true){
            newUserInfo.functionTxt = user.functionTxt;
        }
       
        newUserInfo.online = ((Date.now() - user.latestActive)<5*60*1000);
        newUserInfo.bio = user.bio;
        newUserInfo.isAdmin = user.isAdmin;
        newUserInfo._id = user._id;
        newUserInfo.email = user.email;
        posts = await Posts.find({postedBy:user._id}).sort({_id:-1}).lean()
        if(posts){
        
            posts.forEach(element => {
                element.usrUpVoted = element.upVoted.includes(requestuid.toString());
                element.usrFollow = myUser.following.includes(element._id.toString());
            });
            
            newUserInfo.posts = posts;
            newUserInfo.achivements = user.achivements;
            newUserInfo.law= user.isAdmin?true:false;
            res.json({ok:1, user:newUserInfo});
            return


        }else {
            res.json({ok:0, err:'No posts found'});
        }
    }else {
        res.json({ok:0, err:"User not found"})
        console.log({ok:0, err:'User not found'})
    }

})


/**
 * Upvote Post
 */
  router.post('/up?', async (req, res, next)=>{
    let id = req.query.id;
    let uid = req.user._id;
    if(id === null || id === undefined){
        let found = await User.findOne({_id : uid})
        if(found){
            res.json({ok:1, upVoted:found.upVoted})
            return;
        }else {
            res.json({ok:0})
            return
        }
    }else {
        let found = await User.findOne({_id : uid});
        if (found ){
            let check = found.upVoted;
            if(check.includes(id.toString())){
                //unvote
                await User.updateOne({_id:uid},{ $pull:{
                    upVoted:id.toString()
                }})
                await Posts.updateOne({_id:id}, {
                    $pull:{
                        upVoted:found._id.toString()
                    }
                })
                 /**
                 * Update user tags
                 * Iterates through upvoted post's tags and check if it exists in user's tag field
                 * if exists decrements
                 * if doesnt exist , Error
                 */
                let getPostTags = await Posts.findOne({_id:id})
                getPostTags.tags.forEach(element => {
                    const tagFound = found.tags.some(el => el.tag === element);
                    if (!tagFound) {return null;}
                    else {
                        found.tags.forEach(tag => {
                            if(tag.tag === element ){
                                tag.count--;
                            }
                        });
                    }
                });
                await User.updateOne({_id:uid}, {tags:found.tags})
                let newList= await User.findOne({_id: uid});
                await Posts.updateOne({_id:id}, {$inc:{upVotes:-1}})
                res.json({ok:1, postId:id.toString(), operation:'unvote', upVoted:newList.upVoted})
                return
            }else {
                //vote
                /**
                 * Update user tags
                 * Iterates through upvoted post's tags and check if it exists in user's tag field
                 * if exists increments
                 * if doesnt exist , adds
                 */
                await Posts.updateOne({_id:id}, {
                    $push:{
                        upVoted:found._id.toString()
                    }
                })
                let getPostTags = await Posts.findOne({_id:id})
                getPostTags.tags.forEach(element => {
                    const tagFound = found.tags.some(el => el.tag === element);
                    if (!tagFound) {found.tags.push({ tag:element, count:0 })}
                    else {
                        found.tags.forEach(tag => {
                            if(tag.tag === element ){
                                tag.count++;
                            }
                        });
                    }
                });
                await User.updateOne({_id:uid}, {tags:found.tags})
               
                 await User.updateOne({_id:uid},{ $addToSet:{
                    upVoted:id.toString()
                }})
          
                let newList= await User.findOne({_id: uid});

                await Posts.updateOne({_id:id}, {$inc:{upVotes:1}})
                res.json({ok:1, postId:id.toString(), operation:'vote', upVoted: newList.upVoted})
                return
            }
        }else {
            res.json({ok:0})
        }
    }
  
  res.json({'up':'voted'})
})



router.post('/follow?', async (req, res, next)=>{
    let id = req.query.id;
    let uid = req.user._id;
    if(id === null || id === undefined){
        let found = await User.findOne({_id : uid})
        if(found){
            res.json({ok:1, following:found.following})
            return;
        }else {
            res.json({ok:0})
            return
        }
    }else {
        let found = await User.findOne({_id : uid});
        if (found ){
            let check = found.following;
            if(check.includes(id.toString())){
                //unvote
                await User.updateOne({_id:uid},{ $pull:{
                    following:id.toString()
                }})
                await Posts.updateOne({_id:id}, {$inc:{followers:-1}})
                let newList = await User.findOne({_id:uid})
                res.json({ok:1, postId:id.toString(), operation:'unfollow', followNew: newList.following})
                return
            }else {
                //vote
                await User.updateOne({_id:uid},{ $addToSet:{
                    following:id.toString()
                }})
                await Posts.updateOne({_id:id}, {$inc:{followers:1}})
                let newList = await User.findOne({_id:uid})
                res.json({ok:1, postId:id.toString(), operation:'follow', followNew: newList.following})
                return
            }
        }else {
            res.json({ok:0})
        }
    }
  res.json({'up':'follow'})
})





router.get('/recently', async (req, res, next )=>{
let uid = req.user._id;

let found = await User.findOne({_id:uid});
if(found){
    let posts = await Posts.find({_id:{$in:found.upVoted} }).sort({datePosted:-1}).limit(10)
  //  console.log('upvoted posts are ', posts)
    res.json({ok:1, posts:posts})
    return

}else {
    res.json({ok:0, err:'user not found'})
    return
}

} )

router.get('/following', async(req, res, next)=>{
    let uid = req.user._id;
    let found = await User.findOne({_id:uid});
    if(found){
        let posts = await Posts.find({_id:{$in:found.following}}).sort({lastUpdated:-1}).limit(10).lean()
        posts.forEach(element => {
            element.usrFollow= true;
            element.usrUpVoted = element.upVoted.includes(element._id.toString())
        });
       
    res.json({ok:1, posts:posts})
    return
    }else {
        res.json({ok:0, err:'user not found'})
    }
})

router.get('/posts', async(req, res, next)=>{
let id = req.user._id;
let user = await User.findOne({_id:id});
let usrPost = await Posts.find({postedBy:user._id}).sort({datePosted:-1}).lean();
/**
 * Set user liked of followed to each post
 */
 usrPost.forEach(element => {
     //upvotes usrUpVoted
    element.usrUpVoted = element.upVoted.includes(id);
    //follow usrFollow
    element.usrFollow = user.following.includes(element._id.toString());

});
res.json({ok:1, posts:usrPost})
return
})

/**
 * Get post media for media page
 * 
 */

router.get('/mediaLarge?', async(req, res, next)=>{
let id = req.user._id;
let pid = req.query.id;
let found = await User.findOne({_id:id});
if(found){
    let post = await Posts.findOne({_id:pid});
    if(post){
        res.json({ok:1, media:post.media, header:post.header, postedByUsername:post.postedByUsername, postedBy: post.postedBy})
        return

    }else {
        res.json({ok:0, err:"Post not found!"})
        return
    }
}else{
    res.json({ok:0, err:"User not found!"})
    return
}
})
/**
 * Get info regarding specific post
 * PostPage
 */
router.get('/specificPost?', async(req, res, next)=>{
let uid = req.user._id;
let pid = req.query.id;
if(pid.toString().length!== 24 ){
    res.json({ok:0, err:"Information regarding this post was not found"})
    return
}
let found = await User.findOne({_id:uid})
if(found){
    let postFound = await Posts.findOne({_id:pid}).lean()
   
    if(postFound){
        let commentArr = postFound.comments
        if(commentArr.length != 0){
            commentArr.reverse()
            commentArr.splice(10, commentArr.length)
           // commentArr.limit(10)
        }
        //return post
        let up=false, follow=false, sub=false; 
        if(found.upVoted.includes(postFound._id.toString())){
            up= true;
        }
        if(found.following.includes(postFound._id.toString())){
            follow= true;
        }
        if(found.subscribed.includes(postFound._id.toString())){
            sub= true;
        }
        followNum = postFound.followers;
        upVotesNum = postFound.upVotes;
        res.json({ok:1, post:postFound, up:up, follow:follow, user:found, subscribe:sub, commentArr:commentArr, followNum:followNum, upVotesNum:upVotesNum})
        return
    }else {
        res.json({ok:0, err:"Post not found"})
    }
}else {
    res.json({ok:0, err:"user not found"})
}
})

/**
 * Checks if string s has an space unbreaked array of characters bigger than 50
 * @param {} s - post body 
 * @returns processed String
 */

async function check_if_string_has_big_word(s){
    let regVerify = /\w{50,}/g
    let retString =s.toString();
    let check = await regVerify.exec(retString)
    
    while(check){
        retString = retString.slice(0, check.index+25) + " " + retString.slice(check.index+25);
        check = await regVerify.exec(retString)
    }
   
    return retString
}


/**
 * Add user post
 */
router.post('/posts', async(req, res, next)=>{
    if(req.user !== null && req.user !== undefined){
    let id = req.user._id;
    let user = await User.findOne({_id: id});
    let post = await req.body;
    if(user){
    let postTitle= await post.title.split(/[,. ]+/g);
    let getTags=[];
    postTitle.forEach(element => {
        if (element.length > 3 ){
            getTags = getTags.concat(element)
        }
    });
    let procesedBody = await check_if_string_has_big_word(post.body);
    /**
     * Bugfix 
     * check if body of the post contains words bigger that 50 characters
     * if yes insert space
     * if not do next
     */
    let done = await Posts.create({header:post.title, body: procesedBody, category: post.category, postedBy: user._id, datePosted: Date.now(), tags:getTags, lat: post.lat, long: post.long, country:post.country, region:post.region, postedByUsername:user.username});
    /**
     * ADD OBJECT TAGS EG
     * {tag:"some", count:0}
     */
    let getPostTags = await Posts.findOne({_id:done._id})
                getPostTags.tags.forEach(element => {
                    const tagFound = user.tags.some(el => el.tag === element);
                    if (!tagFound) {user.tags.push({ tag:element, count:0 })}
                    else {
                        user.tags.forEach(tag => {
                            if(tag.tag === element ){
                                tag.count++;
                            }
                        });
                    }
                });
    let usr = await User.updateOne({_id:id}, {tags:user.tags, $inc:{postsNumber:1, postPoints:5}});
    //autofollow your posts
    await User.updateOne({_id:id}, {$push:{following:done._id.toString()}})
    await Posts.updateOne({_id:done._id.toString()},{$inc:{followers:1}})
    /**
     * ADD POINTS AND CHECK FOR ACHIVEMENTS
     */
    let Achiv = await Achivements.find().lean();
    Achiv.forEach(async element => {
        if(user.postPoints >= element.points){
           await User.updateOne({_id:id}, {$addToSet:{achivements:element._id.toString()}})
        }
    });            


    if (done){
        res.json({"ok":1, postId:done._id})
    }else {
        res.json({"ok":0})
    }
    }else {
        res.json({"ok":0})
    }
}else {
        res.json({"ok":0})
    }
})



router.get('/setLocation', async(req, res, next)=>{
    let uid = req.user._id;
    let lat = req.query.lat; 
    let lon = req.query.lon;
    if(lat === undefined || lat === null){lat = ""}
    if(lon === undefined || lon === null){lon = ""}
    lat = lat.length > 9? lat.substring(0, 9):lat;
    lon = lon.length > 9? lon.substring(0, 9):lon;
    let found = await User.findOneAndUpdate({_id:uid}, {lat: lat, long:lon})
    console.log("POSITION UPDATED SUCCESSFULLY !!! ***********************")
    res.json({ok:1, msg:"Lat and Lon updated successfully"});
    return;
})


  router.post('/setlocation', async (req, res, next)=>{
      let lat= await parseFloat(req.query.lat);
      let long = await parseFloat(req.query.long);
        console.log('lat long is ',typeof lat, long)
  
        openGeocoder()
  .reverse(long, lat)
  .end((err, res) => {console.log('response ', res)})

  })

  /**
   * Get feed posts
   */
    router.get('/feed', async (req, res, next )=>{
    let uid = await req.user._id;
    let found = await User.findOne({_id:uid});
    if (found){
        let sorted = found.tags.sort(function(a,b){ 
            var x = a.count > b.count? -1:1; 
            return x; 
        });
        console.log("SORTED ARE ", sorted)
        if(sorted==[]){
            //return random topic posts until user upvotes something
            //wait for count to reach more than 0
            let randomPosts= await Posts.aggregate([{$sample: {size: 10}}]);
            res.json({ok:1, posts:randomPosts});
         
            return
        }
        let sortedArray  = sorted.map(a => a.tag);
        /**
         * fetch 10 posts
         * 4 Very important
         * 3 mid important
         * 3 less important
         * ---------------
         * OR RANDOM NUMBER (Very important)
         * 10-random less important
         * 
         */
        let important = Math.floor(Math.random() * 11); 
        let lessImportant = 10- important;
        let importantArr = sortedArray.splice(0, Math.ceil(sortedArray.length / 2));
        let lessImportantArr = sortedArray.filter(n => !importantArr.includes(sortedArray))
        console.log("important : ", importantArr);
        console.log("LESS IMPORTANT : ", lessImportantArr)
        console.log("Important posts Count : ", important)
        let postsFeed= []
        let getImportantposts = await Posts.aggregate([{$match:{tags:{$in:importantArr}, datePosted: { 
            $lt: new Date(), 
            $gte: new Date(new Date().setDate(new Date().getDate()-1))
          }   }},{$sample: {size: important}}]);   
          /**DEBUG MEASURE */
          if(getImportantposts.length<6){
              let random = await Posts.aggregate([{$sample:{size:10}}])
              random.forEach(element => {
                element.usrUpVoted =  element.upVoted.includes(uid.toString());
                element.usrFollow = found.following.includes(element._id.toString());
           });
           console.log("random posts : ", random)
              res.json({ok:1, posts:random})
              return
          }

        let getLessPosts =   await Posts.aggregate([{$match:{tags:{$in:lessImportantArr},  datePosted : { 
            $lt: new Date(), 
            $gte: new Date(new Date().setDate(new Date().getDate()-1))
          }   }},{$sample: {size: lessImportant}}]); 
          
        postsFeed=postsFeed.concat(getImportantposts)
        postsFeed=postsFeed.concat(getLessPosts)

     


        res.json({ok:1, posts:postsFeed})
    }else {
        res.json({ok:0, err:'user not found'});
    }
  })

  router.get('/upfollow', async(req, res, next)=>{
      let uid = req.user._id;
      let user = await User.findOne({_id: uid})
      if (user){
        let upfollow = [];
        upfollow.push(user.upVoted)
        upfollow.push(user.following)
        res.json({ok:1, info:upfollow})

      }else {
          res.json({ok:0, err:"user not found"})
      }
  })

  /**
 * body : 
 * postID -> id of the post
 * body -> comment text
 * 
 * 
 * 
 */
router.post('/comment', async(req, res, next)=>{
    let uid = req.user._id;
    let io = req.app.get('socketio');
    let found = await User.findOne({_id:uid})
    let pid = req.body.postID;
    let comm= req.body.body.trim();

    let postFound = await Posts.findOne({_id:pid})

    if (found && postFound){
        let obj = {}
        obj.postId=postFound._id.toString();
        obj.postedBy = found._id.toString();
        obj.postedByUsername = found.username.toString();
       obj.avatarUrl= found.avatarUrl;
       obj.body= comm;
       obj.postDate= Date.now();
        await Posts.update({_id:pid}, {$push:{comments:[obj]}})
        /**
         * Push comment notification to 
         * Notification Queue of subscribed users
         */
        /**
         * Increment number on notifications queue on users that subscribed
         * Increment only if uid is not mine
         * No need for notifications that I posted a comment, already know that
         */
        /**
         * Get subscribed users
         * emit to users which are subscribed
         */  await NotificationQ.updateMany({
            "comments.postId":postFound._id.toString(),
            user_id:{
                $ne:found._id.toString()
            }
        }, {
            latestComment:Date.now(),
            $inc:{
                "comments.$.number":1
            }
        })
        let a = await NotificationQ.find({
            "comments.postId":postFound._id.toString(),
        })
        a.forEach(element => {
        io.to(element.user_id.toString()).emit('comment', postFound._id.toString())
        });
        /**
         * trimite tuturor utilizatorilor care se afla pe aceasta pagina notificare ca a fost postat un comentariu
         */
        io.to(postFound._id.toString()).emit("new", found._id.toString())
        let newPostComment = await Posts.findOne({_id: pid}).lean();
        //aici returneaza pe toate
        /***
         * TODO
         * RETURNEAZA MAI MARE CA UN _Id pentru paginatie
         * 
         */
        let newCommentList = newPostComment.comments
        newCommentList.reverse()
        res.json({ok:1, msg:'posted', newArray:newCommentList})
        return;
    }else {
        res.json({ok:0, err:'User or Post not found'})
        return
    }
})

/**
 * New Comments fetch 
 * Daca cineva primeste notificare ca cineva a postat un comentariu in momentul in care amandoi se aflta pe pagina
 * append de commenturi noi
 */
router.get('/appendComment?', async(req, res, next)=>{
//pid = post id
//fcid = first comment id
let pid = req.query.pid;
let lcid = req.query.lcid.toString();
let post = await Posts.findOne({_id:pid}).lean();
if(post){
    let newCommentRaw = post.comments.reverse();
    let commentLength = newCommentRaw.length;
    var index = newCommentRaw.findIndex(p => p._id.toString() == lcid);
    let newComm = newCommentRaw.slice(0, index);
    console.log("NEW comm is : ", newComm)
    res.json({ok:1, newComments: newComm})
    return;
}else {
    res.json({ok:0, err:"Post not found"})
    return
}
})

/**
 * Comment pagination: 
 * req: id of the latest comment
 * res: get the next 10 comments
 */
router.get('/recomment?', async(req, res, next)=>{
    //pid post id
    //lcid : latest comment id
let pid = req.query.pid;
let lcid = req.query.lcid.toString();
let post = await Posts.findOne({_id:pid}).lean();
if(post){
    let commentArrayRaw = post.comments.reverse();
    let commentLength = commentArrayRaw.length;
    if(commentLength <= 10 ){
        res.json({ok:1,newComments:[], bottom:true })
        return
    }
    
    //get the next 10 comments after the latest id
    var index = commentArrayRaw.findIndex(p => p._id.toString() == lcid);

    if(commentArrayRaw[commentLength-1]._id === commentArrayRaw[index]._id ){
        res.json({ok:1,newComments:[], bottom:true })
        return
    }

    let responseComments;
    if((commentLength-1) < index){
        responseComments =  commentArrayRaw.slice(index, commentLength-1)
    }else {
        responseComments =  commentArrayRaw.slice(index, index+10)
    }
     


    res.json({ok:1, newComments: responseComments})
    return
return

}else {
    res.json({ok:0, err:"Post not found"})
    return;
}
})


/**
 * Subscribe to comment notifications from posts
 */
router.post('/subscribe?', async(req, res, next)=>{
    let uid = req.user._id;
    let subid= req.query.id;
    let found = await User.findOne({_id:uid})
    let postFound = await Posts.findOne({_id:subid})
    if(found && found.subscribed && postFound){
        if(found.subscribed.includes(subid.toString())){
            //delete
            await User.updateOne({_id:uid}, {$pull:{subscribed:subid.toString()}})
            let userQueue = await NotificationQ.findOne({user_id:uid});
            let commentQueue= userQueue.comments;
            const check = obj => obj.postId === subid.toString();
            if(commentQueue.some(check)){
               //exists
               //pull from db
                await NotificationQ.findOneAndUpdate({
                    user_id:uid,
                }, {
                    $pull:{
                       comments:{
                          postId:subid,
                       }
                    }
                })
                res.json({ok:1, msg:"Unsubscribed"})
                return;
            }else {
                //doesn't exist
                //throw err
                res.json({ok:0, err:"Cannot unsubscribe because postId or user not found"})
            }
            res.json({ok:1, msg:"Unsubscribed"})
            return
        }else{
            //add
            await User.updateOne({_id:uid}, {$push:{subscribed:subid.toString()}})
            //check if queue exists or not
            let userQueue = await NotificationQ.findOne({user_id:uid});
            let commentQueue = userQueue.comments;
            const check = obj => obj.postId === subid.toString();
            if(commentQueue.some(check)){
                res.json({ok:0, err:"Cannot subscribe because postId or user not found"})
                return
            }else {
                //doesn't exist
                //add array
                let commentNotificationObj = {}
                commentNotificationObj.postId= subid.toString();
                commentNotificationObj.postHeader = postFound.header;
                commentNotificationObj.number= 0;
                await NotificationQ.findOneAndUpdate({user_id:uid},
                    {$push:{
                        comments:commentNotificationObj
                    }})
            }
            res.json({ok:1, msg:"Subscribed"})
            return
        }
    }else {
        res.status(404).json({ok:0, err:'User or Sub list not found'})
    }
})

/**
 * Search Route
 */

 router.get('/search?', async(req, res, next)=>{
     let uid = req.user._id;
     let seed =  req.query.seed.split('_').join(' ');
     let found = await User.findOne({_id:uid});
     if(found){
        if(seed!== undefined && seed !== null && seed !== ""){
          // let userFound = await User.find({$text:{$search:seed.toString()}})
          // let postFound = await Posts.find({$text:{$search:seed.toString()}})

          await User.search(seed.toString(), async function(err, data) {
            await Posts.search(seed.toString(), function(err, postdata) {
                res.json({ok:1, user:data, post:postdata})
             })
          
         })
           return
        }else {
            res.json({ok:0, err:'search query empty'})
            return
        }
     }else {
         res.json({ok:0, err:'user not found'})
         return
         }
 })





 router.post('/chat?', async(req, res, next)=>{
     /**
      * fuid --- from uid
      * tuid --- to uid
      */
     let fuid  = req.user._id;
     let tuid = req.query.id;
     let fFound = await User.findOne({_id:fuid});
     let tFound = await User.findOne({_id:tuid});
     /**Check if both (to and from ) users are valid */
     if(fFound && tFound){
        let check = fFound.chatRooms.some(r=> tFound.chatRooms.indexOf(r) >= 0)
        if(!check){
            //Create new ChatRoom
            let chat = await ChatRooms.create({firstUsr:fFound._id.toString(), secondUsr:tFound._id.toString(), firstAvatarUrl:fFound.avatarUrl, secondAvatarUrl:tFound.avatarUrl, firstUsername:fFound.username, secondUsername:tFound.username});
            if(chat){
                //created
                await User.findOneAndUpdate({_id:fFound._id}, {$addToSet:{chatRooms:chat._id.toString()}})
                await User.findOneAndUpdate({_id:tFound._id}, {$addToSet:{chatRooms:chat._id.toString()}})
                await NotificationQ.findOneAndUpdate({user_id:fuid.toString()}, {$addToSet:{rooms:{roomId:chat._id.toString(), number:0}}})
                await NotificationQ.findOneAndUpdate({user_id:tuid.toString()}, {$addToSet:{rooms:{roomId:chat._id.toString(), number:0}}})
                res.json({ok:1, msg:"Chat room created"})
               // console.log("ADDED")
            }
        }else {
            //Return chatRoom
            console.log("Return chatROom")
            let getChatRoom = await ChatRooms.find({_id:{$in:fFound.chatRooms}}).sort({latestUpdate:-1}).limit(10)
            res.json({ok:1, msg:'ffound', chat:getChatRoom})
        }

     }else {
         res.json({ok:0, err:"User not found!"})
     }
 })



router.get('/room?', async(req, res, next)=>{
    let muid= await req.user._id;
    let croom = await req.query.id;
    let ffound = await User.findOne({_id:muid})
    if(ffound){
        //User found
        if(ffound.chatRooms.includes(croom.toString())){
            let chat = await ChatRooms.findOne({_id:croom});
            let msg = await chat.messages
            res.json({ok:1, chat:msg})
            return;
        }

    }else {
        res.json({ok:0, err:'user not found'})
        return;
    }

})


 router.get('/chat', async(req, res, next)=>{
     let uid = req.user._id;
     let found = await User.findOne({_id:uid});
     if(!found){
         res.json({ok:0, err: 'user not found'})
         return
     }

     let protoAvatars = await ChatRooms.find({_id: found.chatRooms}).sort( { latestUpdate: -1 } )
     
     let newChats=[];
     
     for(let i=0; i<protoAvatars.length; i++){
         if(protoAvatars[i].firstUsr !== uid){
            let ffound = await User.findOne({_id:protoAvatars[i].firstUsr});
            let obj={}
            obj.chat = protoAvatars[i]._id.toString();
            obj.avatar = ffound.avatarUrl
            obj.username = ffound.username
            obj.isAdmin = ffound.isAdmin
            obj.id = ffound._id.toString()
            obj.online= ((Date.now() - ffound.latestActive)<5*60*1000);
            newChats.push(obj)
         }
         if(protoAvatars[i].secondUsr!== uid){
            let ffound = await User.findOne({_id:protoAvatars[i].secondUsr});
            let obj={}
            obj.chat = protoAvatars[i]._id.toString();
            obj.avatar = ffound.avatarUrl
            obj.username = ffound.username
            obj.isAdmin = ffound.isAdmin
            obj.id = ffound._id.toString()
            obj.online= ((Date.now() - ffound.latestActive)<5*60*1000);
            newChats.push(obj)
         }
     }


     let notificationsQ = await NotificationQ.findOne({user_id:found._id}).lean();
   
     res.json({ok:1, chat:newChats, uid: found._id.toString(), notificationsQ:notificationsQ.rooms})
 })




 router.get('/notificationsForChatRooms', async(req, res, next)=>{
    let id = req.user._id;
    let found = await User.findOne({_id:id});
    if(found){
let notificationsQ = await NotificationQ.findOne({user_id:found._id.toString()});
        if(notificationsQ){
            res.json({ok:1, notificationsUpdate : notificationsQ.rooms})
        }else {
            res.json({ok:0, err:"Notifications queue not found"})
            return
        }
    }else {
        res.json({ok:0, err:"User not found"})
        return;
    }
 })

/**
 * Clear messages notifications room queue
 */
router.get('/clearChatMsgQueue?', async (req, res, next)=>{
    console.log("CLEAR Q")
    let uid = req.user._id;
    let qid= req.query.id;
    console.log("UID IS ", uid)
    console.log("QID IS ", qid)
    let QFLAG=0;
    let found = await User.findOne({_id:uid});
    if(found && qid){
    let queueFound = await NotificationQ.findOne({user_id:uid});
    let hokey = await NotificationQ.updateOne({user_id:uid.toString(), "rooms.roomId":qid}, {"rooms.$.number":0});
    let notificationsQ = await NotificationQ.findOne({user_id:found._id.toString()});
    res.json({ok:1, notificationsUpdate : notificationsQ.rooms})
    return

    }else {
res.json({ok:0, err: 'user not found'})
return;
    }

})
/**
 * Get all msg queue for navbar component
 */
router.get('/msgQueue', async(req, res, next)=>{
    let uid = req.user._id;
    let found = await User.findOne({_id:uid});
    let count = 0 ;
    if(found){
        let notifications = await NotificationQ.findOne({user_id:found._id.toString()});
        let rooms = notifications.rooms;
        rooms.forEach(room => {
            count += room.number;
        });
        console.log("Count is ", count)
        res.json({ok:1, number:count});
        return;
    }else {
        res.json({ok:0, err:"User not found!"})
    }
})


/**
 * TODO ROUTE TO SEND MSG
 */
router.post('/sendMsg', async(req, res, next)=>{
    /**
     * body:
     * tuid: to ID
     * ruid: roomid
     * text: asdasdasdasd
     */
    
    console.log("! MSG UID : ", req.user._id)
    let io = req.app.get('socketio')
    let body = await req.body;
    console.log("BODY IS : ", body)
    let uid = await req.user._id;
    let found = await User.findOne({_id:uid})
    let chat = await ChatRooms.findOne({_id:body.ruid.toString()})
    if(found && chat ){
        if(found.chatRooms.includes(chat._id.toString())){
            console.log("First USR")
        await ChatRooms.updateOne({_id:body.ruid.toString()}, {$push:{messages:[{text:body.text, date: Date.now(), from:found._id}]}, latestUpdate:Date.now()})
       
       if(uid.toString() === chat.firstUsr.toString()){

        let avatarUrl = await User.findOne({_id:chat.firstUsr});
        let emitObj = {}
            emitObj.ruid = body.ruid.toString();
            emitObj.from = chat.firstUsername.toString();
            emitObj.avatarUrl = avatarUrl.avatarUrl;
        io.to(chat.secondUsr.toString()).emit('push_notification', emitObj)
        io.to(chat.secondUsr.toString()).emit('message_notification')
        /**
         * toSecond user
         * find the rooms element of user notificationQ
         * iterate through rooms with room:
         * check if room_id exists;
         * if exists: increment;
         * if not : push; roomId, notifications : 1
         * 
         */
        await NotificationQ.findOneAndUpdate({user_id:chat.secondUsr, "rooms.roomId":chat._id.toString()}, {$inc:{"rooms.$.number":1}})
    } //send to second user
        else {
            //To first User
            let emitObj = {}
            emitObj.ruid = body.ruid.toString();
            emitObj.from = chat.secondUsername.toString();
            let avatarUrl = await User.findOne({_id:chat.secondUsr});
            emitObj.avatarUrl = avatarUrl.avatarUrl;
            console.log("Second USR")
            io.to(chat.firstUsr.toString()).emit('push_notification', emitObj )
            io.to(chat.firstUsr.toString()).emit('message_notification')
           let ok =  await NotificationQ.findOneAndUpdate({user_id:chat.firstUsr, "rooms.roomId":chat._id.toString()}, {$inc:{"rooms.$.number":1}})
        }

  
        res.json({ok:1, msg:'sent'})
        }
    }
})



/**
 * Notification zone
 */

/**
 * Get notifications from notification queue
 */
router.get('/notifications', async(req, res, next)=>{
    let uid = req.user._id;
    let found = await User.findOne({_id:uid});
    if(found){
        let notificationsUser =await NotificationQ.findOne({user_id:uid.toString()})
       
        let notifications = []
        notificationsUser.comments.forEach(element => {
            if(element.number>0){
                notifications.push(element)
            }
        });
        let commentsArray = notifications;
        let arr= await commentsArray.sort((a, b)=>{return b.latestComment-a.latestComment})
        let newGroupedQueue=[]
        let queue = notificationsUser.queue.reverse();

        let i=0;
        queue.forEach(element => {
          let flag =0;
          if(newGroupedQueue.length === 0){
            newGroupedQueue.push(element);
            flag = 1;
          }
          if(element.type === newGroupedQueue[i].type && element.url === newGroupedQueue[i].url && flag === 0 )
          {
            newGroupedQueue[i].number++;
            flag=1;
          }

          if(flag === 0){
            newGroupedQueue.push(element);
            i++;
          }
        });
       

        console.log("NOTIFICATIONS ",newGroupedQueue )
        if(newGroupedQueue.length > 20){
            newGroupedQueue.splice(20,newGroupedQueue.length );
        }
        res.json({ok:1, notificationsComments:notificationsUser.comments.slice(1), notifications:newGroupedQueue})
        return

    }else {
        res.json({ok:0, err:'User not found'})
        return;
    }
})


router.post('/clearAuthResponseNotification', async(req, res, next)=>{
    let nid = req.body.nid;
    let id = req.user._id;
    let notif = await NotificationQ.findOne({user_id:id});
    const query = {  "queue._id": nid.toString() };
    const updateDocument = {
      $set: { "queue.$.new": false }
    };
    const result = await NotificationQ.updateOne(query, updateDocument);
    return;
})


/**
 * Get comment notifications
 */

/**
 * Cleares comments queue
 * updating the number to 0
 * @param {*} u1 
 * @param {*} u2 
 */
router.post('/clearCommentQueue?', async(req, res, next)=>{
    let uid = req.user._id;
    let pid = req.query.id;
    let found = await User.findOne({_id:uid});
    if(found){
        //check if notifications.comments exists for this post
        //update the number to 0
        await NotificationQ.findOneAndUpdate({
            user_id: found._id.toString(),
            "comments.postId":pid.toString(),
        }, {
            "comments.$.number":0
        })
        res.json({ok:1, msg:'Comments queue cleared!'})
        return;
    }else {
        res.json({ok:0, err:"User not found"})
    }
})

/**
 * todo function to check if 2 users have a common chatroom
 */
async function checkChat(u1, u2){
    
    let response= await u1.chatRooms.find(element => u2.chatRooms.includes(element))
    if(response !== undefined){
        return response
    }
    return false

}


/**
 * deAnon request route handler
 */

router.post('/deAnonRequest', async(req, res, next)=>{
    let uid = req.user._id;
    let first = req.body.first;
    let last = req.body.last;
    let country = req.body.country;
    let region = req.body.region;
    let found = await User.findOne({_id:uid});
    console.log("************* DE ANON ***********")
    console.log("FIsrt : ", first)
    console.log("last : ", last)
    console.log("country : ", country)
    console.log("region : ", region)

    if(found){
        let deAnonUserQ = await DeAnonQueue.findOne({user_id:uid});
        if(deAnonUserQ){
            res.json({ok:0, err:"Already in queue"});
            return;
        }else {
            await DeAnonQueue.insertMany({user_id:uid, firstName:first, lastName:last, country:country, region:region, mediaFile:"0"});
            await User.findOneAndUpdate({_id:uid}, {pendingAnon:true})
            res.json({ok:1, msg:"User inserted in queue, waiting for approval"});
            return;
        }
    }else { 
        res.json({ok:0, err:'User not found'});
        return;
    }


res.json({ok:1})
})




/**
 * Achivements section
 */

router.get('/MyAchivements', async(req, res, next)=>{
    let uid = req.user._id;
    let found = await User.findOne({_id:uid});
    let achiv = await Achivements.find();
    if(found){
        let achivementsArr = found.achivements;
        res.json({ok:1, postPoints:found.postPoints, my:found.achivements, achivements: achiv})
        return;
    }else {
        res.json({ok:0, err:"User not found"});
        return;
    }
})


/**
 * Experimental top posts function
 */

router.get('/create12hTop', async(req, res, next)=>{
    var today = new Date();
var yesterday = 1;
var check = new Date(today.setDate(today.getDate() - yesterday)).toISOString();
let fPosts = await Posts.find({datePosted:{$gte:check}}).lean()
let Top = await fPosts.sort((a,b)=> (a.upVotes < b.upVotes ? 1: -1))

if(Top.length > 10 ){
    Top.splice(10, Top.length);
}
let postsObj = [];
Top.forEach(element => {
    postsObj.push(element._id.toString())
});
Popular.insertMany({country:"Global", region:"Global", postsId:postsObj, datePopular:Date.now()});
res.json({ok:Top.length, top: Top});
return
})


/**
 * Get the latest Popular in Global
 */
router.get('/popular', async(req, res, next)=>{
    let fpop = await Popular.find({country:"Global"}).sort({_id:-1}).limit(1);
    let posts = await Posts.find({_id:{$in:fpop[0].postsId}})

    res.json({ok:1, Popular:fpop, Posts:posts})
})


router.get('/reloadAuth?', async(req, res, next)=>{
    let id = req.query.id;
    let post = await Posts.find({_id:id.toString()});
    if(post){
        console.log('POst is ', post)
        res.json({ok:1, auth:post[0].authoritiesResponse});
        return;
    }else {
        res.json({ok:0, err:"Post not found"});
        return
    }
})


router.get('/userAchiv?', async (req, res, next) =>{
    let id = req.query.id;
    let found = await User.findOne({_id:id.toString()});
    if(found){
        let achiv = found.achivements;
        let achivements = await Achivements.find({_id:{$in:achiv}});
        res.json({ok:1, achivements:achivements})
        return

    }else{
        res.json({ok:0, err:"User not found"});
        return;
    }

})


router.get('/dismiss_news', async(req, res, next)=>{
    let uid = req.user._id;
    console.log("DISMISS")
   let notification = await notificationQueue.updateOne({user_id:uid}, {"news.$[].news_viewed":true}) 
})

module.exports=router;


