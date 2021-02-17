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
const { post } = require('../router/router')
const { ObjectId } = require('mongodb');

const { runInNewContext } = require('vm')



const bcrypt = require('bcrypt')


/**
 * Extracts mentions and hashtags from a string
 */
const extract = require('mention-hashtag')


const NotificationQ = require('../models/notificationQueue')

const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants')
//console.log("app is ", app)

var imgStorage = multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
    cb(null, req.user._id+'.png')
    }
  })
  
 

  var uploadImg = multer({ dest: 'uploads/' , storage:imgStorage})

  var postStorage = multer.diskStorage({
    destination: './postUploads',
    filename: async function (req, files, cb) {
        
    let actualPost = await Posts.findOne({_id:req.query.postId.toString()});
    if(actualPost){
if(files.mimetype==='video/mp4'){
    
    var crypto = require("crypto");
    var name = crypto.randomBytes(15).toString('hex');
    await Posts.updateOne({_id:req.query.postId.toString()}, {$push:{media:"http://localhost:5000/"+name+".mp4"}})
    cb(null, name+'.mp4')

}
else {
    
        var crypto = require("crypto");
        var name = crypto.randomBytes(15).toString('hex');
        await Posts.updateOne({_id:req.query.postId.toString()}, {$push:{media:"http://localhost:5000/"+name+".png"}})
        cb(null, name+'.png')
    }

}else {
        cb(null, null)
    }
    }
  })

  var postUpload = multer({dest:'/postUploads', storage:postStorage});

/**
 * localhost:{port}/api GET USER INFO
 */

  router.get('/', async (req, res, next) => {
    let id = req.user._id;
    let user = await User.findOne({_id:id})

    let newUser = {id:user._id, email:user.email, avatarUrl:user.avatarUrl, username:user.username, liked :user.liked, following: user.following, country: user.country, region: user.region, upVoted:user.upVoted, feed:user.feed, isAdmin:user.isAdmin}
    if(user){
        res.json({ok:1, user:newUser})
    }
    else {
        res.json({ok:0})
    }
});

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
        res.json({ok:3, msg:"Same user, redirect to /profile"})
        return;
    }
    let posts;
    let newUserInfo={};
    if(user){
        
        newUserInfo.avatarUrl=user.avatarUrl;
        newUserInfo.username= user.username;
        posts = await Posts.find({postedBy:user._id}).sort({_id:-1})
        if(posts){
            newUserInfo.posts=posts;
            res.json({ok:1, user:newUserInfo});
        }else {
            res.json({ok:0, err:'No posts found'});
        }
    }else {
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
    console.log('upvoted posts are ', posts)
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
        let posts = await Posts.find({_id:{$in:found.following}}).sort({datePosted:-1}).limit(10)
        console.log('following posts are ', posts)
        posts.forEach(element => {
            if(found.following.includes(element._id.toString())){
                console.log(posts[element])
            }else{
                element.usrFollow=false;
            }
            return element
        });
        console.log('posts', posts)
    res.json({ok:1, posts:posts})
    return
    }else {
        res.json({ok:0, err:'user not found'})
    }
})

router.get('/posts', async(req, res, next)=>{
let id = req.user._id;
let user = await User.findOne({_id:id});
let usrPost = await Posts.find({postedBy:user._id}).sort({_id:-1});
if(usrPost){
    res.json({ok:1, posts:usrPost})
}else {
    res.json({ok:0, err:"You don't have any posts"})
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
    res.json({ok:0, err:"Post id provided does not follow id schema"})
    return
}
let found = await User.findOne({_id:uid})
if(found){
    let postFound = await Posts.findOne({_id:pid})
    
    if(postFound){
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
        res.json({ok:1, post:postFound, up:up, follow:follow, user:found, subscribe:sub})
        return
    }else {
        res.json({ok:0, err:"post not found"})
    }
}else {
    res.json({ok:0, err:"user not found"})
}
})
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
    console.log("THE TAGS ", getTags)
    let done = await Posts.create({header:post.title, body: post.body, category: post.category, postedBy: user._id, datePosted: Date.now(), tags:getTags});
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
    let usr = await User.updateOne({_id:id}, {tags:user.tags, $inc:{postsNumber:1, postPoints:5}})
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

router.post('/postmedia', postUpload.any('image'), async function (req, res, next) {
    let user = req.user;
    let file = req.files;

    //console.log('the file is ', file)
  })



router.post('/profileAvatar', uploadImg.single('avatar'), async function (req, res, next) {
    let user = req.user;
    let uid = req.user._id;
    let file = req.file;
    if(file){
        let update = await User.updateOne({_id:user._id}, {avatarUrl: "http://localhost:5000/"+user._id+".png"});
        let found = await User.findOne({_id:uid});
        let chatroomsUser = found.chatRooms;
        let chatRooms = await ChatRooms.find({_id:{$in:chatroomsUser}})
        let first = await ChatRooms.update({
            _id:chatroomsUser, firstUsr:found._id.toString()
        }, 
        {firstAvatarUrl:found.avatarUrl})
        let second = await ChatRooms.update({
            _id:chatroomsUser, secondUsr:found._id.toString()
        }, {secondAvatarUrl:found.avatarUrl})

        console.log('first : ',first )
        console.log('second : ', second)

        res.json({ok:1});
    }else {
        res.json({ok:0})
    }
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
                element.userUpVoted =  element.upVoted.includes(uid.toString());
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
        postsFeed.forEach(element => {
            console.log('element is ', element)
       });
        console.log("returned posts ", postsFeed)

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
 * Post a comment
 * @param {*} u1 
 * @param {*} u2 
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
        res.json({ok:1, msg:'posted'})
        return;
    }else {
        res.json({ok:0, err:'User or Post not found'})
        return
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
            let chat = await ChatRooms.create({firstUsr:fFound._id.toString(), secondUsr:tFound._id.toString(), firstAvatarUrl:fFound.avatarUrl, secondAvatarUrl:tFound.avatarUrl});
            if(chat){
                //created
                await User.findOneAndUpdate({_id:fFound._id}, {$addToSet:{chatRooms:chat._id}})
                await User.findOneAndUpdate({_id:tFound._id}, {$addToSet:{chatRooms:chat._id}})
                await NotificationQ.findOneAndUpdate({user_id:fuid.toString()}, {$addToSet:{rooms:{roomId:chat._id.toString(), number:0}}})
                await NotificationQ.findOneAndUpdate({user_id:tuid.toString()}, {$addToSet:{rooms:{roomId:chat._id.toString(), number:0}}})
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
    console.log("CHATROOM")
    if(ffound){
        //User found
        if(ffound.chatRooms.includes(croom.toString())){
            let chat = await ChatRooms.findOne({_id:croom});
            res.json({ok:1, chat:chat})
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
     let avatars = []
     let protoAvatars = await ChatRooms.find({_id: found.chatRooms});
     protoAvatars.forEach(element => {
         if(element.firstUsr!==uid){
             avatars.push(element.firstAvatarUrl)
         }else if(element.secondUsr!==uid){
             avatars.push(element.secondAvatarUrl)
         }
     });
     let newChats=[];
     let i=0;
     found.chatRooms.forEach(element => {
         let obj={}
         obj.chat = element;
        obj.avatar= avatars[i++];
        newChats.push(obj)
     });
    console.log('avatars are ', newChats)
     res.json({ok:1, chat:newChats,avatars:avatars, uid: found._id.toString()})
 })

/**
 * Clear messages notifications room queue
 */
router.get('/clearQueue?', async (req, res, next)=>{
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
    console.log("THIS IS HOKEY : ", hokey)

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
     * tuid: 
     * text: asdasdasdasd
     */
    
    console.log("! MSG UID : ", req.user._id)
    let io = req.app.get('socketio')
    let body = await req.body;
    let uid = await req.user._id;
    let found = await User.findOne({_id:uid})
    let chat = await ChatRooms.findOne({_id:body.ruid.toString()})
    if(found && chat ){
        if(found.chatRooms.includes(chat._id.toString())){
        await ChatRooms.updateOne({_id:body.ruid.toString()}, {$push:{messages:[{text:body.text, date: Date.now(), from:found._id}]}})
       
       if(uid.toString() === chat.firstUsr.toString()){
        io.to(chat.secondUsr.toString()).emit('push_notification', body.ruid.toString())
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
            io.to(chat.firstUsr.toString()).emit('push_notification',body.ruid.toString() )
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
    console.log("NOTIF")
    console.log("uid is ", uid)
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
        console.log('commentsArray ', commentsArray)
        let arr= await commentsArray.sort((a, b)=>{return b.latestComment-a.latestComment})
        
        console.log('HOKEy ', arr)
        res.json({ok:1, notificationsComments:notificationsUser.comments.slice(1), notifications:notificationsUser})
        return

    }else {
        res.json({ok:0, err:'User not found'})
        return;
    }
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


module.exports=router;


