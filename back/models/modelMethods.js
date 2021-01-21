const Users = require('./User');
const Posts = require('./Posts');

async function insert_user(user){
    await Users.insertOne(user)
}

async function insert_post(post){
    await Posts.insertOne(post)
}