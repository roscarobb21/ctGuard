var express = require('express');
var app = express();
var cors = require('cors')
app.use(cors())
/**
 * very simple node image server for the uploads folder
 */
//setting middleware
app.use(express.static(__dirname + '\\uploads')); //Serves resources from public folder

app.use(express.static(__dirname + '\\postUploads'));

var server = app.listen(5000, ()=>{
    console.log('serving images from \\uploads...')
    console.log('serving images from \\postUploads...')
})