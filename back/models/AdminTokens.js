var mongoose = require('mongoose')



const tokenSchema = new mongoose.Schema({ 
   token:{
       type:String,
       required:true},
    validUntil:{
        type:Date,
        default:(()=>{let current= new Date(); return new Date(current.getTime() + 86400000);}),
        required:true,
    }
});


const AdminTokens = mongoose.model('AdminTokens', tokenSchema);

module.exports= AdminTokens || mongoose.models.AdminTokens;