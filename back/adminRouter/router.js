const express = require('express')
const router = express()
const Posts = require('../models/Posts')
const User = require('../models/User')
const { ObjectId } = require('mongodb');

/**
 * Date processing
 */
var moment = require('moment');
moment().format(); 
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
router.get('/post', async(req, res, next)=>{
    console.log("***********************POST CHECK*************************")
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
let category = (req.query.category===undefined || req.query.category === null)?'':req.query.category;
let status = (req.query.status===undefined || req.query.status === null)?'':req.query.status;
let dateFromQuery= (req.query.date===undefined || req.query.date === null)?'':req.query.date;
let number = (req.query.number===undefined || req.query.number === null || (parseInt(req.query.number)<5))?5:parseInt(req.query.number);
let page = (req.query.page===undefined || req.query.page === null)?parseInt(1):parseInt(req.query.page);


let found = await User.findOne({_id:uid})
if(!found){
    res.json({ok:0, err:"User not found"})
    return;
}
let responsePosts = await Posts.find().sort({datePosted:-1});


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
})



router.post('/response', async(req, res, next)=>{
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
        obj.media = []
        await Posts.findOneAndUpdate({_id:pid},{category:category, $push:{authoritiesResponse:obj}})
        res.json({ok:1, msg:"Your response has been pushed"})
        return
    }else {
        res.json({ok:0, err:"User or post provided not found or invalid"});
        return;
    }
})



/**
 * On posts per page change on front end, compute pages and posts 
 */
router.get('/pagination?', async(req, res, next)=>{
    let postsPerPage  = req.query.per !== undefined? req.query.per:5;
    let page = req.query.page!== undefined? req.query.page: 1;
    let postsNumber = await Posts.countDocuments();
    let pages = Math.ceil(postsNumber/postsPerPage);
    
})
module.exports= router;