var mongoose = require('mongoose')
const { ObjectId } = require('mongodb');

const region=new mongoose.Schema({
    regionName:{type:String},
    regionId:{type:String},
    })

const CountrySchema = new mongoose.Schema({ 
    countryName:{type:String},
    countryId:{type:String},
    regions:[{type:region}]
});


const Country = mongoose.model('Country', CountrySchema);

module.exports= Country || mongoose.models.Country;