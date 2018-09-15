
const authServer = require('socket.io-client')('http://localhost:3000');
console.log('야');
authServer.on('connection',(tempsocket)=>{
    console.log('auth server connected');
    var socket = tempsocket;
});
module.exports.testConnection = (res,message)=>{
    console.log('hey');
    socket.emit('testConnection',message);
    socket.on('testConnection',data=>{
        res.send(data);
    });
}
moduyle.exports.faceAuth = (reqUser,userId,userImg)=>{
    socket.emit('authFace',reqUser,reqUser.req.sessinID,)
}
    
//this JS file is deprecated!!!
