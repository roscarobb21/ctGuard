var mongoose = require('mongoose')
const { Schema } = mongoose;
const bcrypt = require('bcrypt')



const postSchema = new mongoose.Schema({ 
header:{
    type:String,
    required: true,
},
body:{
    type:String,
    required:true,
},
likes:{
    type:Number,
    default:0
},
followers:{
    type:Number,
    default:0,
},
postedBy:{
    type:String,
    required:true,
},    
comments:[{postID:{type:String}, postedBy:{type:String, required:true}, body:{type:String, required:true}, postDate:{type:Date, required:true}, }],
});

const Post = mongoose.model('Post', postSchema);

module.exports= Post;