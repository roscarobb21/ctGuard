var mongoose = require('mongoose')
const { Schema } = mongoose;
const { ObjectId } = require('mongodb');



const achivSchema = new mongoose.Schema({ 
  name:{
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
    }
});


const Achivements = mongoose.model('Achivements', achivSchema);

module.exports= Achivements || mongoose.models.Achivements;