var mongoose = require('mongoose')
const { ObjectId } = require('mongodb');



const PopularSchema = new mongoose.Schema({ 
    country:{type:String},
    region:{type:String},
    datePopular:{type:Date},
    postsId:[]
});


const Popular = mongoose.model('Popular', PopularSchema);

module.exports= Popular || mongoose.models.Popular;