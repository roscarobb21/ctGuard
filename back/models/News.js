var mongoose = require('mongoose')
const { ObjectId } = require('mongodb');


  /**
     * NewsType : Alert, Incident, Urgent, Request
     */

const NewsSchema = new mongoose.Schema({ 
    country:{type:String},
    region:{type:String},
    newsText:{type:String},
    newsType:{type:String},
    datePosted:{type:Date}
});


const News = mongoose.model('News', NewsSchema);

module.exports= News || mongoose.models.News;