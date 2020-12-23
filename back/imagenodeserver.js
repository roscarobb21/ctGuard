var express = require('express');
var app = express();
/**
 * very simple node image server for the uploads folder
 */
//setting middleware
app.use(express.static(__dirname + '\\uploads')); //Serves resources from public folder


var server = app.listen(5000, ()=>{
    console.log('serving images from \\uploads...')
})