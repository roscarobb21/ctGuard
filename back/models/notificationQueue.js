var mongoose = require('mongoose')
const { ObjectId } = require('mongodb');

const roomNotification=new mongoose.Schema({
roomId:{
    type:String,
    default:"0"
},
number:{
    type:Number,
    default:0
}
})
const commentNotification=new mongoose.Schema({
    postId:{
        type:String,
        default:"0"
    },
    postHeader:{
        type:String,
        default:"",
    },
    datePosted:{
        type:Date,
    },
    number:{
        type:Number,
        default:0
    },
    latestComment:{
        type:Date,
        default:Date.now(),
    }
    })

const notificationSchema = new mongoose.Schema({ 
    user_id:{
        type:String,
        default:"0",
        required:true
    },
    rooms:[{type:roomNotification, default:{}}],
    comments:[{type:commentNotification, default:{}
    }]
});


const notificationQueue = mongoose.model('notificationQueue', notificationSchema);

module.exports= notificationQueue || mongoose.models.notificationQueue;