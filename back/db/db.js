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
/**
 * Import Logger for validation err and tracking
 */
const writeToLog = require('../logger')


let insertDefaultValuesForEverything = async () => {
    let pass = await bcrypt.hash('admin', 10)
    let client = await mongoose.connect('mongodb://localhost:27017/db', {useNewUrlParser: true});
    

    var UserFound, PostsFound;


    let UserCheck = await User.findOne({username: 'admin'})
    if(UserCheck===null){
         await User.insertMany({username: 'admin', email: 'admin', password: pass})
        writeToLog('DB INFO: Default admin inserted')
    }else {
        writeToLog('DB INFO: User model has admin already')
    }
    UserFound= await User.findOne({username:'admin'})
    

    let PostsCheck = await Posts.findOne({postedBy: UserFound._id})
    if (PostsCheck === null) {
        
      let k = await  Posts.insertMany({header: 'Default post', body: 'Default post', postedBy: UserFound._id, comments:{postedBy:UserFound._id, body:"default comment", postDate:Date.now()}, upVoted:[]})
      writeToLog('DB INFO: Default Post inserted with default comment')
      
    }else {
        writeToLog('DB INFO: Posts has default post already')
    }
    let ChatCheck = await ChatRooms.findOne();
    /**
     * Admin open default chat room with himself
     */
    if(ChatCheck===null){
        let msgObj={from:UserCheck._id, to:UserCheck._id, text:"Default chat Room msg"}
        let defaultChatId= await ChatRooms.insertMany({messages:msgObj, latestUpdate:Date.now(), firstUsr:UserFound._id, secondUsr:UserFound._id})
        console.log('userfound ', defaultChatId)
        await User.updateOne({_id:UserFound._id}, {$push:{chatRooms:defaultChatId[0]._id}})
        await NotificationQ.create({user_id:UserFound._id.toString()})
       // await User.updateOne({_id:UserFound._id}, {$push:{chatRooms:defaultChatId._id}})
    }
    /**
     * INSERT ACHIVEMENTS
     */
    let achivCount= await Achivements.find().countDocuments();
    if(0 === achivCount ){
        //insert Achivements
        for(let i=0 ; i<=10; i++){
           await Achivements.insertMany({name:i.toString(), media:'ok', points:10*i, usersHave:0})
        }
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
    /*
    PostsFound= await Posts.findOne({postedBy:UserFound._id})
    let CommentsFound = await Comment.findOne({postedBy:UserFound.username})
    if(CommentsFound===null ){
        await Comment.insertMany({body:'geegee', postedBy:UserFound._id, postID: PostsFound._id})
        writeToLog('DB INFO: Default Comment inserted')
    }else {
        writeToLog('DB INFO: Comments has default comment already')
    }*/

} 

module.exports=insertDefaultValuesForEverything;
