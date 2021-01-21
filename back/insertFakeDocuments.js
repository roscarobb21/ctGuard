let faker = require('faker')
const User= require('./models/User')
let users=[]
for(let i =0; i<1; i++){
    let obj = {
        username:faker.internet.userName(),
        email:faker.internet.email(),
        password:faker.internet.password(),
        avatarUrl:faker.internet.avatar(),
    }
    users = users.concat(obj)
}
console.log('my obj is ', users)
User.insertMany(users)