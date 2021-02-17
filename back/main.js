var bodyParser = require('body-parser')
const express = require('express')
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
const schedule = require('node-schedule');


const passport = require('passport')
require('./auth/auth')




/**
 * import insertDefault method for db
 */
const db = require('./db/db');
const { async } = require('crypto-random-string');

/**
 * routes
 */
var http = require("http").Server(app);

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


async function ok(){
if(NEED_DATA){
let faker = require('faker')
const User= require('./models/User')
const Posts= require('./models/Posts')
let users=[]
for(let i =0; i<100; i++){
    let obj = {
        username:faker.internet.userName(),
        email:faker.internet.email(),
        password:faker.internet.password(),
        avatarUrl:faker.internet.avatar(),
    }
    users = users.concat(obj)
}
console.log('my obj is ', users)
await User.insertMany(users)
let uids = await User.find({location:"Global"}, {_id:1})
let adminuid = await User.findOne({username:"admin"})
let posts=[]
let adminPosts=[]

for(let i =0; i<100; i++){
    let tags=[]
    let obj = {
        header:faker.lorem.sentence(3, 10),
        body:faker.lorem.sentence(3, 10),
        postedBy:uids[between(0, uids.length)]._id,
    }
    obj.tags=obj.header.split(/[ ,]+/);
    let adminobj={
        header:faker.lorem.sentence(5, 10),
        body:faker.lorem.sentence(3, 10),
        postedBy:adminuid._id.toString(),
    }
    adminobj.tags= adminobj.header.split(/[ ,]+/);
    let getTags = await User.findOne({_id:adminuid._id})
    tags=tags.concat(getTags.tags);
    tags= tags.concat(adminobj.tags)
    let addTags = await User.findOneAndUpdate({_id:adminuid._id}, {tags:tags})
    console.log(adminobj)
    posts = posts.concat(obj)
    adminPosts=adminPosts.concat(adminobj)
}


await Posts.insertMany(posts)
await Posts.insertMany(adminPosts)
let puid = await Posts.find({followers:0}, {_id:1})

}
}

ok();

const job = schedule.scheduleJob('0 1 * * *', function(fireDate){
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

