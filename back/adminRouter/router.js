const express = require('express')
const router = express()
const Posts = require('../models/Posts')
const User = require('../models/User')
const Achivements = require('../models/Achivements')
const News = require('../models/News')

const { ObjectId } = require('mongodb');

/**
 * Date processing
 */
var moment = require('moment');
const DeAnonQueue = require('../models/DeAnonQueue');
const { async } = require('crypto-random-string');
const notificationQueue = require('../models/notificationQueue');
const { response } = require('express')

/**
 * Get admin user info
 * Info provided : 
 *  {email, username, avatarUrl, anon, isAdmin}
 */
router.get('/', async(req, res, next)=>{
    let uid = req.user._id;
    let found = await User.findOne({_id:uid});
    if(found){
        let foundObj = {}
        foundObj.email = found.email;
        foundObj.username = found.username;
        foundObj.avatarUrl = found.avatarUrl;
        foundObj.anon = found.anon;
        foundObj.isAdmin = found.isAdmin;
        res.json({ok:1, user:foundObj})
        return;
    }else {
        res.json({ok:0, err:'User not found'})
        return
    }
    
})

/**
 * Get posts with different filters 
 * Implement pagination
 */
/**
 * Pagination :  
 * get current number of posts per page 
 * get current page
 * compute current posts 
 */
router.get('/post?', async(req, res, next)=>{
    console.log("***********************POST CHECK*************************")
    console.log("QUERY IS : ",req.query)
    /**
     * for frontend
     *    data=[{
        header:"x2Cl5tBvuVHRcvq1v0cnx0a6IqM9yJ",
        body:"x2Cl5tBvuVHRcvq1v0cnx0a6IqM9yJ",
        postedBy:"x2Cl5tBvuVHRcvq1v0cnx0a6IqM9yJ",
        datePosted:"x2Cl5tBvuVHRcvq1v0cnx0a6IqM9yJ",
        status:"x2Cl5tBvuVHRcvq1v0cnx0a6IqM9yJ",
        upVotes:"x2Cl5tBvuVHRcvq1v0cnx0a6IqM9yJ",
        followers:'x2Cl5tBvuVHRcvq1v0cnx0a6IqM9yJ'
    }]
     */


let uid = req.user._id
let check = req.query.orderby

let orderby = req.query.orderby === undefined?true:req.query.orderby === 'null'?null:req.query.orderby === 'true'?true:false
console.log("🚀 ~ file: router.js ~ line 74 ~ router.get ~ orderby", orderby)

let ascending = req.query.ascending === undefined?null:req.query.ascending === 'null'?null:req.query.ascending === 'true'?true:false
console.log("🚀 ~ file: router.js ~ line 77 ~ router.get ~ ascending", ascending)

let category = (req.query.category===undefined || req.query.category === null)?'':req.query.category;
let status = (req.query.status===undefined || req.query.status === null)?'':req.query.status;
console.log("🚀 ~ file: router.js ~ line 73 ~ router.get ~ status", status)

let datelower= (req.query.datelower===undefined || req.query.datelower === null)?'':req.query.datelower;
let dateupper= (req.query.dateupper===undefined || req.query.dateupper === null)?'':req.query.dateupper;
let number = (req.query.number===undefined || req.query.number === null || (parseInt(req.query.number)<5))?5:parseInt(req.query.number);
console.log("🚀 ~ file: router.js ~ line 78 ~ router.get ~ number", number)
let page = (req.query.page===undefined || req.query.page === null)?parseInt(1):parseInt(req.query.page);
console.log("🚀 ~ file: router.js ~ line 79 ~ router.get ~ page", page)


let responsePostsRaw = await Posts.find({$and: [
    {category:category===''?{$exists:true}:category},
    {status:status===''?{$exists:true}:status},
    {datePosted:datelower===''?{$exists:true}:{$gte:datelower}},
    {datePosted:dateupper===''?{$exists:true}:{$lte:dateupper}}
]
}).lean()

/**
 * Order by upvotes
 */
let responsePostsOrder
if(orderby && orderby !== null){
        //order by upvotes
        console.log("order by upvotes")
        responsePostsOrder = responsePostsRaw.sort((a,b)=> (a.upVotes > b.upVotes ? 1 : -1)).reverse()
}else if (orderby === false){
        //order by following
        console.log("order by followers")
        responsePostsOrder = responsePostsRaw.sort((a,b)=> (a.followers > b.followers ? 1 : -1)).reverse()
}else {
        //no specific order
        console.log("no order")
        responsePostsOrder = responsePostsRaw
}

/**
 * Order by Date
 */
 let responsePosts
 if(ascending && ascending !== null){
         //order by upvotes
         console.log("order ascending")
         responsePosts = responsePostsOrder.sort((a,b)=> (a.datePosted > b.datePosted ? 1 : -1))
 }else if (ascending === false){
         //order by following
         console.log("order descending")
         responsePosts = responsePostsOrder.sort((a,b)=> (a.datePosted < b.datePosted ? 1 : -1))
 }else {
         //no specific order
         console.log("no date order")
         responsePosts = responsePostsOrder
 }


/**
 * Pagination
 */

let pgNr = Math.ceil(responsePosts.length/number)

//how many pages do we have?
let pages = Array.from({length: pgNr}, (_, i) => i + 1)
//which posts should correspond to this page
let processedPosts = responsePosts.slice(number*(page-1), number*(page-1)+number)

let processedPostsBody = processedPosts;
processedPostsBody.forEach(async element => {
    if (element.body.length > 350){
        element.body = element.body.substring(0, 350) + "..."
    }
});
let processedPostsDate = processedPostsBody;

for(let i=0; i<processedPostsDate.length; i++){
    processedPostsDate[i].datePostedStr = moment(processedPostsDate[i].datePosted).format('MMMM Do YYYY, h:mm:ss a')
}

res.json({ok:1,number:responsePosts.length,posts:processedPostsDate, pages:pages})

})

/**
 * Post user response for specific post 
 * Push notification to users which follow this matter
 */

router.post('/response', async(req, res, next)=>{
    let io = req.app.get('socketio')
    let uid = req.user._id;
    let pid = req.body.postId;
    let body= req.body.body;
    let category = req.body.category;
    let media = "";
    let currentStatus = req.body.currentStatus;
    let found = await User.findOne({_id:uid});
    let pfound = await Posts.findOne({_id:pid});
    if(found && pfound){
        let previousStatus = pfound.status;
        let obj = {}
        obj.postedBy=uid;
        obj.body=body;
        obj.category= category;
        obj.previousStatus = previousStatus;
        obj.currentStatus = currentStatus;
        obj.postedByUsername= found.username;
        obj.avatarUrl = found.avatarUrl;
        obj.media = []
        await Posts.findOneAndUpdate({_id:pid},{category:category, $push:{authoritiesResponse:obj}, lastUpdated:Date.now(), status:obj.currentStatus});
       //get users which follow
       console.log("POST ID : ", pfound._id.toString());
       let users = await User.find({following:pfound._id.toString()})
       console.log("The users are : ", users)
       let objN = {};
       objN.date = Date.now();
       objN.title = previousStatus!==obj.currentStatus?'Status change on '+pfound.header:'Authorities response post: '+pfound.header;
       objN.url = pfound._id.toString();
       objN.type = previousStatus!==obj.currentStatus?'status':'response';
       objN.number = 1;
       let idArr = []
       users.forEach( async user => {
        idArr.push(user._id.toString());
        await notificationQueue.updateOne({user_id:user._id.toString()},{$push:{
            queue: objN
        }})
       });
       
       io.to(pfound._id.toString()).emit('specific_post_auth_response', 'fetch')
       idArr.forEach(element => {
       io.to(element).emit('following_post_notification', objN)
       });

        res.json({ok:1, msg:"Your response has been pushed"})
        return
    }else {
        res.json({ok:0, err:"User or post provided not found or invalid"});
        return;
    }
})

/**
 * Pull deAnonRequest form pool. Give verdict.
 */
router.get('/deAnonReq', async(req, res, next)=>{
    let uid = req.user._id;
    console.log("🚀 ~ file: router.js ~ line 206 ~ router.get ~ uid", uid)
    
    let found = await User.findOne({_id:uid});
    if(found){
       // let Queue = await DeAnonQueue.aggregate([{$match:{country:found.country}}, {$sample:{size:1}}])
       let Queue =  await DeAnonQueue.aggregate([{$sample:{size:1}}])
        if(Queue){
            res.json({ok:1, user : Queue});
            return;
        }else {
            res.json({ok:0, err:"Queue empty"});
            return;
        }
    }else {
        res.json({ok:0, err:'User not found'});
        return;
    }
})

router.post('/deAnonTrue', async(req, res, next)=>{
    let uid = req.user._id;
    let deUid = req.body.uid;
    console.log("🚀 ~ file: router.js ~ line 229 ~ router.post ~ deUid", deUid)
    let found = await User.findOne({_id:uid});
    let Qfound = await DeAnonQueue.findOne({user_id:deUid});
    let Dfound = await User.findOne({_id:deUid});
    if(found && Qfound && Dfound ){
        let achiv = await Achivements.find();
        achiv.reverse();

        let newUserInfo = await User.findOneAndUpdate({_id:deUid}, {
            firstName: Qfound.firstName,
            lastName: Qfound.lastName,
            country: Qfound.country,
            region: Qfound.region,
            isVerified:true,
            anon:false,
            pendingAnon:false,
            anonFlag:false,
        })
        await User.findOneAndUpdate({_id:deUid}, {$addToSet:{achivements:achiv[1]._id.toString()}})
      await DeAnonQueue.findOneAndRemove({user_id:deUid});
        res.json({ok:1, msg:"deAnon successfully"});
        return;
    }else {
        res.json({ok:0, err:"Server exception. User not found."});
        return;
    }
})
router.post('/deAnonFalse', async(req, res, next)=>{
    let uid = req.user._id;
    let deUid = req.body.uid;
    let found = await User.findOne({_id:uid});
    let Qfound = await DeAnonQueue({user_id:deUid});
    let Dfound = await User.findOne({_id:deUid});
    if(found && Qfound && Dfound ){
        await DeAnonQueue.findOneAndRemove({user_id:deUid});
        res.json({ok:1, msg:"deAnon removed from queue"});
        return;
    }else {
        res.json({ok:0, err:"Server exception. User not found."});
        return;
    }
})


router.post('/push_news', async(req, res, next)=>{
    let io = req.app.get('socketio');
    let uid = req.user._id;
    let country = req.body.country;
    let region = req.body.region;
    let type = req.body.type;
    let text = req.body.text;

    let news = await News.insertMany({country:country, region:region, newsType:type, newsText:text, datePosted:Date.now()})
    console.log("🚀 ~ file: router.js ~ line 283 ~ router.post ~ news", news)

    let found = await User.find({country:country, region:region})
    if(found.length === 0){
        //no users in that region
    }
    let pushObj = {}
    pushObj.news_id = news[0]._id.toString();

    /**
     *   news_id:{type:String},
  news_viewed:{type:Boolean, default:false},
  news_stayOnScreen:{type:Boolean, default:false}
     */
    found.forEach( async (element) => {
       
        await notificationQueue.update({user_id:element._id}, {$push:{news:pushObj}})
        io.to(element._id.toString()).emit("push_news", news )
    });



    res.json({ok:1, msg:"News posted !"})


})







module.exports= router;







/**
 * 
 * FILTER
 * 
 * /*
 var filtered = responsePosts.filter(function(value, index, arr){ 
     let catMask = 0;
     let statusMask = 0;
     let dateMask = 0;
    if(category !== ''){
        catMask = 1}
    if(status !== ''){
        statusMask = 1}
    if(dateFromQuery !== ''){
       dateMask = 1}
      

        if(catMask === 1 && statusMask === 1 && dateMask ===1){
            return (value.category === category && value.status === status && moment(value.datePosted).isSame(dateFromQuery, 'day'))
        }
        if(catMask === 1 && statusMask === 1 && dateMask ===0){
            return (value.category === category && value.status === status)
        }
        if(catMask === 1 && statusMask === 0 && dateMask ===1){
            return (value.category === category && moment(value.datePosted).isSame(dateFromQuery, 'day'))
        }
        if(catMask === 0 && statusMask === 1 && dateMask ===1){
            return (value.status === status && moment(value.datePosted).isSame(dateFromQuery, 'day'))
        }
        if(catMask === 1 && statusMask === 0 && dateMask ===0){
            return (value.category === category)
        }
        if(catMask === 0 && statusMask === 1 && dateMask ===0){
            return (value.status === status)
        }
        if(catMask === 0 && statusMask === 0 && dateMask ===1){
            return (moment(value.datePosted).isSame(dateFromQuery, 'day'))
        }
        if(catMask === 0 && statusMask === 0 && dateMask ===0){
            return true;
        }
    
});






let found = await User.findOne({_id:uid})
if(!found){
    res.json({ok:0, err:"User not found"})
    return;
}
let responsePosts = await Posts.find().sort({datePosted:-1}).lean();
responsePosts.forEach(element => {
    element.body = element.body.length>250?element.body.substring(0, 250)+"...":element.body
});


console.log('typeof filtered ', typeof filtered)
        function chunk (arr, len) {
            var chunks = [],
                i = 0,
                n = arr.length;
               
            while (i < n) {
              chunks.push(arr.slice(i, i += len));
            }
            return chunks;
          }
          
          filtered = chunk(filtered, number)
          let pages= [];
          
          for(let i = 0; i< filtered.length; i++){
            pages.push(i+1)
          }

res.json({ok:1,number:filtered[page-1]===undefined?0:filtered[page-1].length,posts:filtered[page-1]===undefined?[]:filtered[page-1], pages:pages})
*/