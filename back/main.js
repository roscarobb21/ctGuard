var bodyParser = require('body-parser')
const express = require('express')
var cors = require('cors')
const app = express()
//const app = require("https-localhost")()
app.use(express.json());
app.use(cors())
const router = require('./router/router')
const secretRouter = require('./secretRouter/router')
/**
 * Logger
 */
const writeToLog = require('./logger')


const passport = require('passport')
require('./auth/auth')


const port = 3001;

/**
 * import insertDefault method for db
 */
const db = require('./db/db')

/**
 * routes
 */

app.use('/', router)
app.use('/api', passport.authenticate('jwt', {session: false}), secretRouter);

/**
 * Initialize db
 */
db();

/**
 * server listen to Port
 */
app.listen(port, () => {

    console.log(`Example app listening at http://localhost:${port}`)
})
