var mongoose = require('mongoose')
const { Schema } = mongoose;
const bcrypt = require('bcrypt')



const userSchema = new mongoose.Schema({ 
username:{
    type:String,
    unique:true,
    required: true,
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
firstName:String,
lastName:String,    
following:[],
liked:[],
avatarUrl:{
    type:String,
    default:"https://cdn.iconscout.com/icon/free/png-256/avatar-370-456322.png"
}
});

const User = mongoose.model('Users', userSchema);





module.exports= User;


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


