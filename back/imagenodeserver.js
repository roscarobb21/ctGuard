var express = require('express');
var app = express();
var cors = require('cors')
app.use(cors())
/**
 * very simple node image server for the uploads folder
 */
//setting middleware
app.use(express.static(__dirname + '\\uploads')); //Serves resources from public folder
app.use(express.static(__dirname + '\\achivementsImg'))
app.use('/deAnon',express.static(__dirname + '\\deAnonUploads'));
app.use('/postMedia',express.static(__dirname + '\\postMedia'));
app.use('/avatarUploads',express.static(__dirname + '\\avatarUploads') )

var server = app.listen(5000, ()=>{
    console.log("cnd server running!")
})


