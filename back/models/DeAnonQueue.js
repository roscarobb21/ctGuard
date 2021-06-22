var mongoose = require('mongoose')
const { Schema } = mongoose;
const { ObjectId } = require('mongodb');



const anonSchema = new mongoose.Schema({ 
    user_id:{
        type:String,
        required:true,
    },
    firstName: {
        type:String,
        required:true,
    },
    lastName: {
        type:String,
        required:true,
    },
    country:{
        type:String,
        required:true,
    },
    region: {
        type:String,
        required:true,
    },
    mediaFile:{
        type:String,
        required:true,
    }
}
);


const DeAnonQueue = mongoose.model('DeAnonQueue', anonSchema);

module.exports= DeAnonQueue || mongoose.models.DeAnonQueue;