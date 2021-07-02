var mongoose = require('mongoose')
const { Schema } = mongoose;
const bcrypt = require('bcrypt')


const TagSchema = new mongoose.Schema({
    tag: String,
    count: Number
});

const userSchema = new mongoose.Schema({ 
username:{
    type:String,
    unique:true,
    required: true,
    text:true,
},
email:{
    type:String,
    unique:true,
    required:true,
},
password:{
    type:String,
    required:true
},  
following:[],
upVoted:[],
avatarUrl:{
    type:String,
    default:"default.jpg"
},
location:{
    type:String,
    default:"Global"
},
country:{
    type:String,
    default:"Romania"
},
region:{
    type:String,
    default:"Suceava",
    text:true
},
lat :{type:String, default:""},
long :{type:String, default:""},
tags:[
    {tag:{type:String}, count:{type:Number}}
],

feed:{
    type:Boolean,
    default:true,
},
postsNumber:{
    type:Number,
    default:0
},
chatRooms:[],
anon:{
    type:Boolean,
    default:true,
},
achivements:[],
postPoints:{
    type:Number,
    default: 0,
},
approvedPoints:{
    type:Number,
    default:0
},
subscribed:[],
isAdmin:{
    type:Boolean,
    default:false,
}, 
firstName:{
    type:String,
},
lastName:{
    type:String,
},
isVerified:{
    type:Boolean,
},
pendingAnon:{
    type:Boolean,
    default:false,
},
anonFlag:{
    type:Boolean,
    default:true,
},
achivements:[],
achivementsShowcase:[],
resetPassToken:{
    type:String,
},
darkTheme:{
    type:Boolean,
    default:false,
},
bio:{
    type:String,
    default:"",
    maxlength:255
},
functionTxt:{
    type:String,
    default:"",
    maxlength:255
},
latestActive:{
    type:Date,
},
confirmed:{
    type:Boolean,
},
registrationToken:{
    type:String,
},
registrationDate:{
    type:Date,
    default:Date.now()
}
});




userSchema.statics = {
    searchPartial: function(q, callback) {
        return this.find({
            $or: [
                { "username": new RegExp(q, "gi") },
                { "region": new RegExp(q, "gi") },
            ]
        }, callback);
    },

    searchFull: function (q, callback) {
        return this.find({
            $text: { $search: q, $caseSensitive: false }
        }, callback)
    },

    search: function(q, callback) {
        this.searchFull(q, (err, data) => {
            if (err) return callback(err, data);
            if (!err && data.length) return callback(err, data);
            if (!err && data.length === 0) return this.searchPartial(q, callback);
        });
    },
}
const User = mongoose.model('Users', userSchema);


module.exports= User || mongoose.models.User;

//export default mongoose.models.Post || mongoose.model('Post', PostSchema)
/*
let main= async()=>{
    let pass= await bcrypt.hash('admin', 10);
MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("db");
    dbo.createCollection("Users", function(err, res) {
      dbo.collection("Users").findOne({username:'admin'}).then((res)=>{
            console.log('res ', res)
            if(res === null){
                dbo.collection("Users").insertOne({username:'admin', password : pass, firstName:'admin', lastNmae:'admin', email:'admin@admin.com'});
                console.log('admin inserted')
            }else {
                console.log('geegee')
            }
      })
     
    });


  });
}
main();
*/



/*
let generateUserModel= async ()=>{
const UserSchema = new Schema({
    email:String,
  username:String,
  password:String,
  firstName: String,
  lastName: String,
  date: { type: Date, default: Date.now },
 
});
const User = mongoose.model('Users', UserSchema);
let pass = await  bcrypt.hash('admin', 10);
   // const doc = new User({username:'admin', email:'admin', password: pass, firstName:'admin', lastName:'admin'});
   // doc.save();
    module.exports= UserSchema;
}

generateUserModel();
*/


