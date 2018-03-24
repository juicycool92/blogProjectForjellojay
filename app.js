var express = require('express');
var app = express();
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieSession = require('cookie-session') ;
app.set('views',path.resolve(__dirname,'views'));
app.set('view engine','ejs');
app.use(express.static(path.join(__dirname,"static")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.set('trust proxy', 1) // trust first proxy
app.use(cookieSession({
    name : 'mySession',
    keys : ['myKey1','myKey2']
}));

app.listen(8080,()=>{
    console.log('server ist up');
});


app.use((req,res,next)=>{
    var remoteIp = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress || 
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
        remoteIp = remoteIp.split(':').slice(-1)[0];
    if(remoteIp == '1')
        remoteIp = 'localhost';

    var today = new Date();
    var logStr;
    today = today.setMinutes(0,0,0);
    if(!req.session.lastVisit | req.session.lastVisit != today){
        req.session.lastVisit = today;
        console.log('time stamp changed!!');
        logStr = '[INFO]['+remoteIp+']['+new Date()+']access/visit counted\n';
    }else{
        logStr = '[INFO]['+remoteIp+']['+new Date()+']access\n';
    }
    console.log('attemp write '+logStr);
    fs.appendFile('log.txt',logStr,(err)=>{
        console.log('??');
        if(err){
            console.log('error on write log');
        }
    });
    next();
});
var blogModule = require('./modules/blogModule.js');
var codeModule = require('./modules/codeModule.js');
var jsonCreator = require('./modules/jsonCreator.js');
var replyModule = require('./modules/replyModule.js');
var main = require('./routes/main.js')(app);
var board = require('./routes/board.js')(app,blogModule,codeModule,jsonCreator);
var blog = require('./routes/blog.js')(app,blogModule,jsonCreator);
var code = require('./routes/code.js')(app,codeModule,jsonCreator);
var reply = require('./routes/reply.js')(app,replyModule,jsonCreator);

