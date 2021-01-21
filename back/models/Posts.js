var mongoose = require('mongoose')
const { Schema } = mongoose;
const bcrypt = require('bcrypt')

const Comment=new mongoose.Schema({
    postId:{type:String},
    postedBy:{type:String},
    avatarUrl:{type:String},
    body:{type:String},
    postDate:{type:Date}
    })

const postSchema = new mongoose.Schema({ 
header:{
    type:String,
    required: true,
    text:true,
},
body:{
    type:String,
    required:true,
    text:true,
},
upVotes:{
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
comments:[{type:Comment}],
media:[{type:String}],
datePosted:{
    type:Date,
},
updatedDate:{
    type:Date,
},
tags:{
    type:Array,
    default:[]
},
category:{
    type:String,
    default:"Request"
},
status:{
    type:Number,
    default:1
},
blockStatus:{
    type:String,
    default:""
},
authorities:{
    type:Boolean,
    default:false,
},
authoritiesResponse:{
    type:String,
    default:""
}
});
/**
 * Status:
 * 1 --- new
 * 2 --- in progress
 * 3 --- closed
 * 4 --- blockStatus: reason
 */
postSchema.statics = {
    searchPartial: function(q, callback) {
        return this.find({
            $or: [
                { "header": new RegExp(q, "gi") },
                { "body": new RegExp(q, "gi") },
            ]
        }, callback);
    },

    searchFull: function (q, callback) {
        return this.find({
            $text: { $search: q, $caseSensitive: false }
        }, callback)
    },

    search: function(q, callback) {
        this.searchFull(q, (err, data) => {
            if (err) return callback(err, data);
            if (!err && data.length) return callback(err, data);
            if (!err && data.length === 0) return this.searchPartial(q, callback);
        });
    },
}

const Post = mongoose.model('Post', postSchema);

module.exports= Post || mongoose.models.Post;