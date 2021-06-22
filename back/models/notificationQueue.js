var mongoose = require('mongoose')
const { ObjectId } = require('mongodb');



const nq=new mongoose.Schema({
    id:{type:Number},
    date:{type:Date},
    title:{type:String},
    url:{type:String},
    type:{type:String},
    number:{type:Number},
    new:{type:Boolean, default:true}
    })


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

const newsNotification=new mongoose.Schema({
  news_id:{type:String},
  news_viewed:{type:Boolean, default:false},
  news_stayOnScreen:{type:Boolean, default:false}
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
    const queue=new mongoose.Schema({
        
        })


const notificationSchema = new mongoose.Schema({ 
    user_id:{
        type:String,
        default:"0",
        required:true
    },
    rooms:[{type:roomNotification, default:{}}],
    comments:[{type:commentNotification, default:{}
    }],
    news:[{type:newsNotification}],
    queue:[{type:nq}],
});


const notificationQueue = mongoose.model('notificationQueue', notificationSchema);

module.exports= notificationQueue || mongoose.models.notificationQueue;