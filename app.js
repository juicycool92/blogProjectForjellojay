var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser')
app.set('views',path.resolve(__dirname,'views'));
app.set('view engine','ejs');
app.use(express.static(path.join(__dirname,"static")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.listen(8080,()=>{
    console.log('server ist up');
});



var blogModule = require('./modules/blogModule.js');
var jsonCreator = require('./modules/jsonCreator.js');
var replyModule = require('./modules/replyModule.js');
var main = require('./routes/main.js')(app);
var blog = require('./routes/blog.js')(app,blogModule,jsonCreator);
var reply = require('./routes/reply.js')(app,replyModule,jsonCreator);3
