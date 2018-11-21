//require('throw-max-listeners-error');
var express = require('express');
var timedout = require('connect-timeout');

var app = express();
var path = require('path');
const session = require('express-session')({
    secret: 'keyboard cat', 
    resave: true, 
    saveUninitialized: true,
});
var sharedsession = require('express-socket.io-session');
var bodyParser = require('body-parser');
var cookieSession = require('cookie-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;


var counterModule = require('./modules/counterModule');
var fs = require('fs');
const keys = {
    key  : fs.readFileSync('./pem/private.pem'),
    cert : fs.readFileSync('./pem/public.pem')
}
app.set('trust proxy', 1) // trust first proxy

app.set('views',path.resolve(__dirname,'views'));
app.set('view engine','ejs');
app.use(timedout(120000));
app.use(haltOnTimedout);//타임아웃 설정! 27번 라인과 함께 추가됨!(default is 20 second)
app.use(express.static(path.join(__dirname,"static")));
app.use(session);

app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

app.use(passport.initialize());
app.use(passport.session());

const http = require('http').createServer(app);
const https = require('https').Server(keys,app);
const io = require('socket.io')(https);
io.use(sharedsession(session,{
    autoSave:true
}));
http.listen(8082,()=>{
    console.log('http 8082 up');
});
https.listen(443,()=>{
    console.log('https 403 up');
});
/*app.listen(8082,()=>{
    console.log('server ist up');
});
*/
const authServerSocket = require('./modules/authServerModule.js');
var User = require('./modules/User.js');
var passportModule = require('./modules/passportModule.js')(passport,User);
var blogModule = require('./modules/blogModule.js');
var codeModule = require('./modules/codeModule.js');
var jsonCreator = require('./modules/jsonCreator.js');
var replyModule = require('./modules/replyModule.js');
var mainModule = require('./modules/mainModule.js');
//var socketModule = require('./modules/socketModule.js');
//var socketRoutes = require('./routes/socketRoutes.js');
var main = require('./routes/main.js')(app,counterModule,mainModule,jsonCreator,passport,/*forTest delete when not use*/io,authServerSocket);
var board = require('./routes/board.js')(app,blogModule,codeModule,jsonCreator);
var blog = require('./routes/blog.js')(app,blogModule,jsonCreator);
var code = require('./routes/code.js')(app,codeModule,jsonCreator);
var reply = require('./routes/reply.js')(app,replyModule,jsonCreator);
var account = require('./routes/account.js')(app,jsonCreator,User,passport,authServerSocket);
var admin = require('./routes/admin.js')(app,mainModule,jsonCreator);


function haltOnTimedout(req,res,next){
    if(!req.timedout) next();
}

