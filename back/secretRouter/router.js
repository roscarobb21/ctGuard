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

    let newUser = {id:user._id, email:user.email, avatarUrl:user.avatarUrl, username:user.username, liked :user.liked, following: user.following, country: user.country, region: user.region, upVoted:user.upVoted, feed:user.feed}
    if(user){
        res.json({ok:1, user:newUser})
    }
    else {
        res.json({ok:0})
    }
});

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
        let up=false, follow=false;
        if(found.upVoted.includes(postFound._id.toString())){
            up=true;
        }
        if(found.following.includes(postFound._id.toString())){
            follow= true;
        }
        res.json({ok:1, post:postFound, up:up, follow:follow, user:found})
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
    let usr = await User.updateOne({_id:id}, {tags:user.tags, $inc:{postsNumber:1}})
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
    let file = req.file;
    if(file){
        let found = await User.updateOne({_id:user._id}, {avatarUrl: "http://localhost:5000/"+user._id+".png"});
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
              res.json({ok:1, posts:random})
              return
          }

        let getLessPosts =   await Posts.aggregate([{$match:{tags:{$in:lessImportantArr},  datePosted : { 
            $lt: new Date(), 
            $gte: new Date(new Date().setDate(new Date().getDate()-1))
          }   }},{$sample: {size: lessImportant}}]); 
          
        postsFeed=postsFeed.concat(getImportantposts)
        postsFeed=postsFeed.concat(getLessPosts)
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
     res.json({ok:1, search:'true'})
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
       let response = fFound.chatRooms.find(element => tFound.chatRooms.includes(element));    
      
        if(response!== undefined ){
            let getChatRoom = await ChatRooms.findOne({_id:response})
            console.log('Return !undefined')
            res.json({ok:2, chatroom:getChatRoom});
            return;
        }
        /**if Valid create chat room */
        let chat = await ChatRooms.insertMany({firstUsr:fFound._id, secondUsr:tFound._id, firstAvatarUrl:fFound.avatarUrl, secondAvatarUrl:tFound.avatarUrl});
        console.log('the room created has id : ', chat[0])
        await User.updateOne({_id:fuid}, {$push:{chatRooms:chat[0]._id}})
        await User.updateOne({_id:tuid}, {$push:{chatRooms:chat[0]._id}})
        res.json({ok:1, chatroom:chat._id});
        return;
     }else if(fFound){
        let getChatRoom = await ChatRooms.find({_id:{$in:fFound.chatRooms}}).sort({latestUpdate:-1}).limit(10)
        res.json({ok:1, msg:'ffound', chat:getChatRoom})
     }
     else {
         /**If not valid return error */
         res.json({ok:0, err:'From or To user not found'})
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
     /*
     if(found){
        let chat = await ChatRooms.find({_id:{$in:found.chatRooms}})
        res.json({ok:1, chats:chat})
        return
     }else {
         res.json({ok:0, err:'user not found'})
     }*/
     res.json({ok:1, chat:found.chatRooms})
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
    
    
    let io = req.app.get('socketio')
    let body = await req.body;
    let uid = await req.user._id;
    let found = await User.findOne({_id:uid})
    let chat = await ChatRooms.findOne({_id:body.ruid.toString()})
    if(found && chat ){
        console.log("SEND")
        if(found.chatRooms.includes(chat._id.toString())){
        await ChatRooms.updateOne({_id:body.ruid.toString()}, {$push:{messages:[{text:body.text, date: Date.now(), from:found._id}]}})
        io.emit(body.ruid.toString(), 'update')
        res.json({ok:1, msg:'sent'})
        }
    }
})

router.get('/notifications', async(req, res, next)=>{
            let io = req.app.get('socketio')
            io.on('notifications', ()=>{
                console.log("not")
            })
})
/**
 * Post comment
 * @param {*} u1 
 * @param {*} u2 
 */
router.post('/comment', async(req, res, next)=>{
   console.log("Comment ", req.body)
    let uid = req.user._id;
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
         res.json({ok:1, msg:'posted'})
         return

    }else {
        res.json({ok:0, err:'User or Post not found'})
        return
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