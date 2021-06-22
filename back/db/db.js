var MongoClient = require('mongodb').MongoClient;
var mongoose = require('mongoose');
/**
 * Bcrypt for password hashing
 */
const bcrypt = require('bcrypt');
const cryptoRandomString = require('crypto-random-string');
/**
 * Import All Models
 */
const User = require('../models/User');
const Posts = require('../models/Posts');
const Comment= require('../models/Comments');
const ChatRooms= require('../models/Chat');
const NotificationQ=require('../models/notificationQueue');
const Achivements = require('../models/Achivements');
const AdminTokens = require('../models/AdminTokens');
const DeAnonQueue = require('../models/DeAnonQueue');
const News = require('../models/News');

const Popular = require("../models/Popular");
const Country = require("../models/Country");
/**
 * Import Logger for validation err and tracking
 */
const writeToLog = require('../logger')


let insertDefaultValuesForEverything = async () => {
    console.log("*****INSERT DEFAULT VALUES*****");
    let pass = await bcrypt.hash('admin', 10)
    let client = await mongoose.connect('mongodb://localhost:27017/db', {useNewUrlParser: true});
      /**
     * INSERT ACHIVEMENTS
     */
    let achivNames=["Responsible Citizen Of Society", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
    let achivDesc=["Registered on ctGuard! Keep up doing the good work.", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
       let achivCount= await Achivements.find().countDocuments();
       if(0 === achivCount ){
           //insert Achivements
           for(let i=0 ; i<=10; i++){
              await Achivements.insertMany({name:achivNames[i],description:achivDesc[i], media:i==0?'security.jpg':i+'.jpg', points:10*i, usersHave:0})
           }
           await Achivements.insertMany({name:"Trusted User !", description:"You have trust in society and society has trust in you. You got nothing to hide!", anon:false, usersHave:0, media:"trust.jpg"})
           await Achivements.insertMany({name:"Authorities representative", description:"", authorities:true, usersHave:0, media:"policeman.jpg"})
          // await Achivements.insertMany({name:"Trusted User !", description:"You have trust in society and society has trust in you. You got nothing to hide!", anon:false, usersHave:0, media:"trust.jpg"})
       }

    var UserFound, PostsFound;


    let UserCheck = await User.findOne({username: 'admin'})
    if(UserCheck===null){
         await User.insertMany({username: 'admin', email: 'admin@ctGuard.com', password: pass})
        writeToLog('DB INFO: Default admin inserted')
    }else {
        writeToLog('DB INFO: User model has admin already')
    }
    UserFound= await User.findOne({username:'admin'})
    

    let PostsCheck = await Posts.findOne({postedBy: UserFound._id})
    if (PostsCheck === null) {
        
      let k = await  Posts.insertMany({header: 'Default post', body: 'Default post',postedByUsername: UserFound.username, postedBy: UserFound._id, comments:{postedBy:UserFound._id, body:"default comment", postDate:Date.now()}, upVoted:[]})
      writeToLog('DB INFO: Default Post inserted with default comment')
      
    }else {
        writeToLog('DB INFO: Posts has default post already')
    }
    let ChatCheck = await ChatRooms.count();
    /**
     * Admin open default chat room with himself
     */
    if(ChatCheck===0){
        let msgObj={from:UserFound._id, to:UserFound._id, text:"Default chat Room msg"}
        let defaultChatId= await ChatRooms.insertMany({messages:msgObj, latestUpdate:Date.now(), firstUsr:UserFound._id, secondUsr:UserFound._id})
        console.log('userfound ', defaultChatId)
        await User.updateOne({_id:UserFound._id}, {$push:{chatRooms:defaultChatId[0]._id}})
        await NotificationQ.create({user_id:UserFound._id.toString()})
       // await User.updateOne({_id:UserFound._id}, {$push:{chatRooms:defaultChatId._id}})
    }
  
    let adminTokens = await AdminTokens.countDocuments();
    if(adminTokens===0){
        let adminArr= [];
        for(let i=0; i<100; i++){
        let tok = await cryptoRandomString({length: 30, type: 'base64'});
        adminArr.push({token:tok})
        }
        await AdminTokens.insertMany(adminArr)
    }

    let DeAnonData = await DeAnonQueue.count();
    if(DeAnonData === 0 ){
        await DeAnonQueue.insertMany({user_id:'0', firstName:'0', lastName:'0',country: '0', region:'0', mediaFile:'0' })
    }

    /**
     * Count country number
     * if number is 0 
     * insert Romania and USA
     */
    let CountryData = await Country.count();
    console.log("🚀 ~ file: db.js ~ line 103 ~ insertDefaultValuesForEverything ~ CountryData", CountryData)
    
    if(CountryData === 0 ){
        let obj = {}
        obj.regionName = "Global";
        obj.regionId = "1";
        await Country.insertMany({countryName:'Global', countryId:'1', regions:obj})

       
        obj.regionName = "Suceava";
        obj.regionId = "1";
        await Country.insertMany({countryName:'Romania', countryId:'2', regions:obj})
    }

    let PopularData = await Popular.count();

    if(PopularData === 0){
        await Popular.insertMany({country:"Default", region:"Default", datePopular:Date.now(), postsId:[]})
    
    }

    let newsData = await News.count();

    /**
     *    country:{type:String},
    region:{type:String},
    newsText:{type:String},
    newsType:{type:String},
    datePosted:{type:Date}
     */
  
    if(newsData === 0){
        await News.insertMany({country:"Romania", region:"Suceava", newsText:"Default", newsType:"Incident", datePosted:Date.now()})
    }
  
    console.log("*****INSERT DEFAULT VALUES ENDED*****");
} 

module.exports=insertDefaultValuesForEverything;


  /*
    PostsFound= await Posts.findOne({postedBy:UserFound._id})
    let CommentsFound = await Comment.findOne({postedBy:UserFound.username})
    if(CommentsFound===null ){
        await Comment.insertMany({body:'geegee', postedBy:UserFound._id, postID: PostsFound._id})
        writeToLog('DB INFO: Default Comment inserted')
    }else {
        writeToLog('DB INFO: Comments has default comment already')
    }*/