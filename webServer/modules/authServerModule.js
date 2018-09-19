const authServer = require('socket.io-client')('http://localhost:3000');
const userReqManager = require('./userReqManager.js');
let userReqArr = new userReqManager();//this class is for returning response who is send request.
setTimeout( function cleaner(){ 
    const result = userReqArr.expireCheck(new Date());
    result ? console.log(result) : '';
    setTimeout(cleaner,5000);
},5000);
setTimeout( function mapChecker(){ 
    userReqArr.currentKeys();
    setTimeout(mapChecker,2000);
},2000);
//this is userReqManager cleanning function. in depends on your computer spec, feel free to change repeat time

authServer.on('connect',()=>{
    console.log('server connected');
    module.exports.testConnection = (reqStatus,message)=>{  //this is test func
        userReqArr.setKV(reqStatus);
        authServer.emit('testConnection',message,reqStatus.req.sessionID);
    }
    module.exports.authFace = (reqStatus,userId,userImg)=>{
        //이미 맵에 해당 Key가 있는지 확인
        //이미 있다면 버리자. 
        if(userReqArr.getValue(reqStatus[0].sessionID)){
            console.log(`reqeust is already exist!! drop it!`);
            return;
        }else{
            console.log(`reqeust is not exist, request send`);
            userReqArr.setKV(reqStatus);
            authServer.emit('authFace',userId,userImg,reqStatus[0].sessionID);
        }
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
        
        console.log(`result is arrived, userId : [${userId}], SID : [${SID}], isSuccess? [${isSuccess}] Error? : [${err}]`);
        
        
        if(isSuccess){  //인증에 성공한 겨웅 in case of auth is successfully.
            //send back with auth info here!!!
            console.log('인증 성공 했떠요 !!!');
            resTarget[0].logIn(userId,(err)=>{
                if(err){
                    console.log(`error on authServerModule.js auth!!!`);
                }else{
                    resTarget.status(200).json({isSuccess : true, message : null});
                }
            });
            
        }else{  //인증에 실패한 경우 in case of auth is failed.
            try{
                switch(err[0]){
                    case 0 : {//require more request for image
                        console.log(`switch case 0`)
                        resTarget.status(300).json({isSuccess : false, message : err[1]});
                        break;
                    }
                    case 1 : {//image detecting failed
                        console.log(`switch case 1`)
                        resTarget.status(300).json({isSuccess : false,message : err[1]});
                        break;
                    }
                    case 2 : {//server internal error
                        console.log(`switch case 2`)
                        resTarget.status(500).json({isSuccess : false,message : err[1]});
                        break;
                    }
                    case 3 : {
                        console.log(`switch case 3`)
                        resTarget.status(401).json({isSuccess : false, message : err[1]});
                        break;
                    }
                    default : {
                        console.log("[CRITICAL] server got undefined error on communicate with authServer 'authFace' ");
                        break;
                    }
                }
            }catch(e){
                console.log(`trying to response [${SID}], but its already sent! WTH?`);
            }
            
        }
        try{
            userReqArr.removeReq(SID);
        }catch(e){
            console.log('[WARN] selected req is not in array. might be cleaned by cleaner function');
        }
        return;
    });
});
