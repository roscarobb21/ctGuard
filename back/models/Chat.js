var mongoose = require('mongoose')
const { Schema } = mongoose;
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');

const msg=new mongoose.Schema({
from:{type:ObjectId},
to:{type:ObjectId},
text:{type:String},
date:{type:Date, default: Date.now()}
})

const chatSchema = new mongoose.Schema({ 
    roomId:{type:ObjectId},
    latestUpdate:{type:Date,
    default:Date.now()},
    firstUsr:{type:String},
    firstAvatarUrl:{type:String},
    secondUsr:{type:String},
    secondAvatarUrl:{type:String},
    messages:[{type:msg}],
});


const ChatRooms = mongoose.model('ChatRooms', chatSchema);

module.exports= ChatRooms || mongoose.models.ChatRooms;