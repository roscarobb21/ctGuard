var bodyParser = require('body-parser')
const express = require('express')
const fileUpload = require('express-fileupload');
var cors = require('cors')
const app = express()
//const app = require("https-localhost")()
app.use(express.json());
app.use(cors());

const socket = require('./secretRouter/sockets')

const cryptoRandomString = require('crypto-random-string');
/**
 * PORT 
 */
const port = process.env.PORT || 3001;


const router = require('./router/router')
const secretRouter = require('./secretRouter/router')
const adminRouter = require('./adminRouter/router')
/**
 * TODO
 * Add method for Posts and User with tag support 
 */
const NEED_DATA = false;
/**
 * Logger
 */
const writeToLog = require('./logger')
/**
 * Schedule adminTokens
 */
const AdminTokens= require('./models/AdminTokens');
const Country = require('./models/Country');
const Posts = require('./models/Posts')
const Popular = require('./models/Popular')
const schedule = require('node-schedule');


const passport = require('passport')
require('./auth/auth')




/**
 * import insertDefault method for db
 */
const db = require('./db/db');
const { async } = require('crypto-random-string');
const { SSL_OP_EPHEMERAL_RSA } = require('constants');
const User = require('./models/User');
const Achivements = require('./models/Achivements');
const { resolveSoa } = require('dns');

/**
 * routes
 */
var http = require("http").Server(app);


getRandomLatency = (min, max)=>{
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//Insert fake latency 
app.use( ( req, res, next ) => {
  setTimeout(next, getRandomLatency(500, 1500));
});

/**
 * Force 12h TOP
 */
//force12h();






app.use(fileUpload())

app.use('/', router)
app.use('/api', passport.authenticate('jwt', {session: false}), secretRouter); 
app.use('/admin', passport.authenticate('admin', {session: false}), adminRouter); 

var io = require("socket.io")(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: false
  }
});


io.sockets.on('connection', function(socket) {
  socket.on('join_push_notifications', function(myid) {
    console.log("----------------------")
    console.log("User requested to join push notification on id : ", myid)
    socket.join(myid);
    console.log("----User Joined----")
    console.log("-----------------")
  });
  socket.on('create_room', function(room) {
    socket.join(room);
  });
  socket.on('msg', function(room){
    console.log('msg on room : ', room)
  });
  socket.on('post_view', function(room){
    socket.join(room);
    console.log("Post room joined ", room)
  })
  socket.on('post_connection', function(room){
    socket.join(room);
    console.log("Post auth notification ", room)
  })

 

});




io.on('typing', (socket)=>{
  io.broadcast.emit('typing')
})
io.on('stop_typing', (socket)=>{
  console.log('stop')
  io.broadcast.emit('stop_typing')
})
io.on('disconnect', () => {
  console.log('user disconnected');
});




app.set('socketio', io)


/**
 * Initialize db
 */
db();



http.listen(port, cors(), function(){
    console.log('listening on 3001')
})




/**
 * server listen to Port
 */
/*
app.listen(port, () => {
   console.log(`Example app listening at http://localhost:${port}`)  
})*/





/**
 * Add fake data
 */
function between(min, max) {  
    return Math.floor(
      Math.random() * (max - min) + min
    )
  }





/*
AdminTokens.remove().then(async ()=>{
  let adminTokens = await AdminTokens.countDocuments();
  if(adminTokens===0){
      let adminArr= [];
      for(let i=0; i<100; i++){
      let tok = await cryptoRandomString({length: 30, type: 'base64'});
      adminArr.push({token:tok})
      }
      await AdminTokens.insertMany(adminArr)
  }
  console.log("Refreshed the Admin Tokens from database")
})*/

const AdminJob = schedule.scheduleJob('0 1 * * *', function(fireDate){
  AdminTokens.remove().then(async ()=>{
    let adminTokens = await AdminTokens.countDocuments();
    if(adminTokens===0){
        let adminArr= [];
        for(let i=0; i<100; i++){
        let tok = await cryptoRandomString({length: 30, type: 'base64'});
        adminArr.push({token:tok})
        }
        await AdminTokens.insertMany(adminArr)
    }
    console.log("Refreshed the Admin Tokens from database")
  })
});

/**
 * Force 12h TOP on start
 */

async function force12h(){
  var today = new Date();
  var yesterday = 1;
  var check = new Date(today.setDate(today.getDate() - yesterday)).toISOString();
  let fPosts = await Posts.find({datePosted:{$gte:check}}).lean()
  let Top = await fPosts.sort((a,b)=> (a.upVotes < b.upVotes ? 1: -1))
  
  if(Top.length > 10 ){
      Top.splice(10, Top.length);
  }
  let postsObj = [];
  Top.forEach(element => {
      postsObj.push(element._id.toString())
  });
  Popular.insertMany({country:"Global", region:"Global", postsId:postsObj, datePopular:Date.now()});
}

/**
 * 
 *   var today = new Date();
  var yesterday = 1;
  var check = new Date(today.setDate(today.getDate() - yesterday)).toISOString();
  let fPosts = await Posts.find({datePosted:{$gte:check}}).lean()
  let Top = await fPosts.sort((a,b)=> (a.upVotes < b.upVotes ? 1: -1))
  
  if(Top.length > 10 ){
      Top.splice(10, Top.length);
  }
  let postsObj = [];
  Top.forEach(element => {
      postsObj.push(element._id.toString())
  });
  Popular.insertMany({country:"Global", region:"Global", postsId:postsObj, datePopular:Date.now()});
 */


const PopularTopJob = schedule.scheduleJob('0 */12 * * *', async function(fireDate){
  var today = new Date();
  var yesterday = 1;
  var check = new Date(today.setDate(today.getDate() - yesterday)).toISOString();
  let fPosts = await Posts.find({datePosted:{$gte:check}}).lean()
  let Top = await fPosts.sort((a,b)=> (a.upVotes < b.upVotes ? 1: -1))
  
  if(Top.length > 10 ){
      Top.splice(10, Top.length);
  }
  let postsObj = [];
  Top.forEach(element => {
      postsObj.push(element._id.toString())
  });
  Popular.insertMany({country:"Global", region:"Global", postsId:postsObj, datePopular:Date.now()});
});




/*
const achivementsJob = schedule.scheduleJob('* * * * *',async function(fireDate){
  //refresh achivements for all users
  let achivementsList = await Achivements.find().lean();
  
   await User.updateMany({postPoints:{$gte:0}}, {$addToSet:{achivements:achivementsList[0]._id.toString()}})
   await User.updateMany({postPoints:{$gte:10}}, {$addToSet:{achivements:achivementsList[1]._id.toString()}})
   await User.updateMany({postPoints:{$gte:20}}, {$addToSet:{achivements:achivementsList[2]._id.toString()}})
   await User.updateMany({postPoints:{$gte:30}}, {$addToSet:{achivements:achivementsList[3]._id.toString()}})
   await User.updateMany({postPoints:{$gte:40}}, {$addToSet:{achivements:achivementsList[4]._id.toString()}})
   await User.updateMany({postPoints:{$gte:50}}, {$addToSet:{achivements:achivementsList[5]._id.toString()}})
   await User.updateMany({postPoints:{$gte:60}}, {$addToSet:{achivements:achivementsList[6]._id.toString()}})
   await User.updateMany({postPoints:{$gte:70}}, {$addToSet:{achivements:achivementsList[7]._id.toString()}})
   await User.updateMany({postPoints:{$gte:80}}, {$addToSet:{achivements:achivementsList[8]._id.toString()}})
   await User.updateMany({postPoints:{$gte:90}}, {$addToSet:{achivements:achivementsList[9]._id.toString()}})
   await User.updateMany({postPoints:{$gte:100}}, {$addToSet:{achivements:achivementsList[10]._id.toString()}})
   await User.updateMany({isAdmin:true}, {$addToSet:{achivements:achivementsList[11]._id.toString()}})
   await User.updateMany({isAdmin:true}, {$addToSet:{achivements:achivementsList[12]._id.toString()}})
     console.log("Users achivements Updated ! ");
});

*/