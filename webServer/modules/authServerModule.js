const authServer = require('socket.io-client')('http://localhost:3000');
const userReqManager = require('./userReqManager.js');
let userReqArr = new userReqManager();//this class is for returning response who is send request.
authServer.on('connect',()=>{
    console.log('server connected');
    module.exports.testConnection = (reqStatus,message)=>{  //this is test func
        userReqArr.setKV(reqStatus);
        authServer.emit('testConnection',message,reqStatus.req.sessionID);
    }
    module.exports.authFace = (reqStatus,userId,userImg)=>{
        userReqArr.setKV(reqStatus);
        authServer.emit('authFace',userId,userImg,reqStatus[0].sessionID);
    }
    authServer.on('testConnection',(data,SID)=>{
        const resTarget = userReqArr.getValue(SID);
        if(resTarget){
            resTarget.send(data);    
        }
        else{
            console.log(`request user[ ${SID} ] is not in MAP !!! drop result!`)
        }
    });
    authServer.on('authFace',(userId,SID,isSuccess,err)=>{
        const resTarget = userReqArr.getValue(SID);
        console.log(`result is arrived, userId : ${userId}, SID : ${SID}, isSuccessfully? ${isSuccess} or got Error? : ${err}`)
        try{
            userReqArr.removeReq(SID);
        }catch(e){
            console.log('[WARN] selected req is not in array. might be cleaned by cleaner function');
        }
        
        if(isSuccess){  //인증에 성공한 겨웅 in case of auth is successfully.
            //send back with auth info here!!!

        }else{  //인증에 실패한 경우 in case of auth is failed.
            try{
                console.log(`${resTarget.statusCode}`);
            }catch(e){

            }

            
            switch(err[0]){
                case 0 : {//require more request for image
                    resTarget.status(300).json({isSuccess : false, message : err[1]});
                    break;
                }
                case 1 : {//image detecting failed
                    resTarget.status(300).json({isSuccess : false,message : err[1]});
                    break;
                }
                case 2 : {//server internal error
                    resTarget.status(500).json({isSuccess : false,message : err[1]});
                    break;
                }
                case 3 : {
                    resTarget.status(401).json({isSuccess : false, message : err[1]});
                    break;
                }
                default : {
                    console.log("[CRITICAL] server got undefined error on communicate with authServer 'authFace' ");
                    break;
                }
            }
        }
    });
    
    setTimeout( function cleaner(){ 
        const result = userReqArr.expireCheck(new Date());
        result ? console.log(result) : '';
        setTimeout(cleaner,5000);
    },5000);
    //this is userReqManager cleanning function. in depends on your computer spec, feel free to change repeat time
});
