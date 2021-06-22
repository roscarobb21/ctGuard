var mongoose = require('mongoose')
const { Schema } = mongoose;
const { ObjectId } = require('mongodb');



const achivSchema = new mongoose.Schema({ 
  name:{
      type:String,
  }, 
  description:{
    type:String,
  },
  media:{
      type:Array,
    },
    points:{
        type:Number,
    },
    usersHave:{
        type:Number,
        default:0,
    },
    anon:{
        type:Boolean
    },
    authorities:{
        type:Boolean
    }
});


const Achivements = mongoose.model('Achivements', achivSchema);

module.exports= Achivements || mongoose.models.Achivements;