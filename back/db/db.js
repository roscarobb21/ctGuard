var MongoClient = require('mongodb').MongoClient;
var mongoose = require('mongoose');
/**
 * Bcrypt for password hashing
 */
const bcrypt = require('bcrypt');

/**
 * Import All Models
 */
const User = require('../models/User');
const Posts = require('../models/Posts');
const Comment= require('../models/Comments');
/**
 * Import Logger for validation err and tracking
 */
const writeToLog = require('../logger')


let insertDefaultValuesForEverything = async () => {
    let pass = await bcrypt.hash('admin', 10)
    mongoose.connect('mongodb://localhost:27017/db', {useNewUrlParser: true});


    let UserFound, PostsFound;


    let UserCheck = await User.findOne({username: 'admin'})
    if(UserCheck===null){
         await User.insertMany({username: 'admin', email: 'admin', password: pass})
        writeToLog('DB INFO: Default admin inserted')
    }else {
        writeToLog('DB INFO: User model has admin already')
    }
    UserFound= await User.findOne({username:'admin'})
    //console.log('userfound ', UserFound)

    let PostsCheck = await Posts.findOne({postedBy: UserFound._id})
    if (PostsCheck === null) {
        
      let k = await  Posts.insertMany({header: 'Default post', body: 'Default post', postedBy: UserFound._id, comments:{postedBy:UserFound._id, body:"default comment", postDate:Date.now()}})
      writeToLog('DB INFO: Default Post inserted with default comment')
      
    }else {
        writeToLog('DB INFO: Posts has default post already')
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
