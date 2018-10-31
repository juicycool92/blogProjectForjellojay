const authServer = require('socket.io-client')('http://localhost:3000');
const userReqManager = require('./userReqManager.js');
const passport = require('passport');

let userReqArr = new userReqManager();//this class is for returning response who is send request.

setTimeout(function cleaner() {
    const result = userReqArr.expireCheck(new Date());
    result ? console.log(result) : '';
    setTimeout(cleaner, 5000);
}, 5000);
//this is userReqManager cleanning function. in depends on your computer spec, feel free to change repeat time

setTimeout(function mapChecker() {
    userReqArr.currentKeys();
    setTimeout(mapChecker, 2000);
}, 2000);
//this is userReqManager checker, when its not need anymore, remove it for batter performance.
// THIS IS KEEP STACK EVENT INTO EVENT EMITTER. IT WILL CAUSE SERVER PERFORMANCE ISSUE.
// REMOVE IT WHEN MONITOR IS NOT NEED ANYMORE ! ! !
const emptyRequest = (SID)=>{
    try {//failed or not, this request are done for use and responsed. clearing userReqArr for another request.
        userReqArr.removeReq(SID);
    } catch (e) {
        console.log('[WARN] selected req is not in array. might be cleaned by cleaner function');
    }
}
authServer.on('connect', () => {
    console.log(`[INFO][${new Date().toUTCString()}]authServer connected and ready up`);
    module.exports.authFace = (reqStatus, userId, userImg) => {
        if (!userReqArr.getValue(reqStatus[0].sessionID)) {
            userReqArr.setKV(reqStatus);
            return authServer.emit('authFace', userId, userImg, reqStatus[0].sessionID);
        }
        reqStatus[1].status(412).json({message:"server busy"});
        console.log(`[CRITICAL][authServerModule.js][authFace]user request before got response preview's request. REJECTED`);
        return;
    }
    module.exports.updateFace = (reqStatus, userId, userImg) => {
        if (!userReqArr.getValue(reqStatus[0].sessionID)) {
            userReqArr.setKV(reqStatus);
            return authServer.emit('updateFace', userId, userImg, reqStatus[0].sessionID);
        }
        reqStatus[1].status(412).json({message:"server busy"});
        console.log(`[CRITICAL][authServerModule.js][updateFace]user request before got response preview's request. REJECTED`);
        return;
    }
    module.exports.registFace = (reqStatus, userId, userImg) => {
        if (!userReqArr.getValue(reqStatus[0].sessionID)) {
            userReqArr.setKV(reqStatus);
            return authServer.emit('registFace', userId, userImg, reqStatus[0].sessionID);
        }
        reqStatus[1].status(412).json({message:"server busy"});
        console.log(`[CRITICAL][authServerModule.js][registFace]user request before got response preview's request. REJECTED`);
        return;
    }
    module.exports.pushFaceInfo = (reqStatus) => {
        if (!userReqArr.getValue(reqStatus[0].sessionID)) {
            userReqArr.setKV(reqStatus);
            return authServer.emit('pushFaceInfo', reqStatus[0].sessionID);
        }
        reqStatus[1].status(412).json({message:"server busy"});
        console.log(`[CRITICAL][authServerModule.js][pushFaceInfo]user request before got response preview's request. REJECTED`);
        return;
    }
    /*
        this function cause called in account routes.
        this is very first stage for face auth. 
        check if current user already request to face auth, it's drop current request.
        because auth server are already busy for auth this user. 
        authServers are not accept request sametime before responde preview's request.
    */

    authServer.on('authFace', (userId, SID, isSuccess, err) => {
        const resTarget = userReqArr.getValue(SID);
        if(!resTarget)
            return console.log(`[CRITICAL][authFace eventListener][${SID}]givin SID is already fulshed!!!`);
        if (isSuccess) {  //in case of auth is successfully.
            passport.authenticate('faceAuth',(err,user,info)=>{//give user authenticate.
                if(err || !user){
                    //in case of unhandled error.
                    if(!info){
                        resTarget.res.status(400).json({message:"Unexpect error"});
                    }else{
                        resTarget.res.status(400).json({message:info});
                    }
                    console.log(info);
                }else{
                    resTarget.req.logIn(user,(err)=>{
                        if (err) {
                            console.log(`[CRITICAL][authServerModule.js][req.logIn()]error on authServerModule.js auth!!!`);
                        } else {
                            resTarget.res.status(200).json({ isSuccess: true, message: null });
                        }
                    });
                }
                return;
            })(userId);

        } else {  //case of auth is failed.
            
            try {
                switch (err[0]) {
                    case 0: {//require more request for image
                        resTarget.res.status(300).json({ isSuccess: false, message: err[1] }); break;
                    }
                    case 1: {//image detecting failed
                        resTarget.res.status(300).json({ isSuccess: false, message: err[1] }); break;
                    }
                    case 2: {//server internal error
                        resTarget.res.status(500).json({ isSuccess: false, message: err[1] }); break;
                    }
                    case 3: {//rejected cause timed out
                        resTarget.res.status(401).json({ isSuccess: false, message: err[1] }); break;
                    }
                    default: {
                        console.log("[CRITICAL] server got undefined error on communicate with authServer 'authFace' "); break;
                    }
                }
                resTarget.res.send();
            } catch (e) {
                console.log(`[CRITICAL][authServerModule.js][authFace event]trying to response [${SID}], but its already sent! WTH?`);
            }

        }
        try {//failed or not, this request are done for use and responsed. clearing userReqArr for another request.
            userReqArr.removeReq(SID);
        } catch (e) {
            console.log('[WARN] selected req is not in array. might be cleaned by cleaner function');
        }
        return;
    });
    /*
        this socket event is response for face auth. rather than success or failed, web server need to 
        response back to client for next attemp.
        if its success, contain new user auth info via passport CustomStrategy.
        for more info about CustomStrategy, look passportModule.js
    */
    authServer.on('updateFace',(userId, SID, isSuccess, err, totalImgLen)=>{
        const resTarget = userReqArr.getValue(SID);
        if(!resTarget)
            return console.log(`[CRITICAL][updateFace eventListener][${SID}]givin SID is already fulshed!!!`);
        
        if(isSuccess){
            resTarget.res.status(200).json({ isSuccess: true, message: null, imgLen : totalImgLen });
        }else{
            try{
                switch(err[0]){
                    case 1 : {
                        resTarget.res.status(300).json({ isSuccess: false, message: err[1], imgLen : null });
                        break;
                    }
                    case 2 : {
                        resTarget.res.status(500).json({ isSuccess: false, message: err[1], imgLen : null });
                        break;
                    }
                    case 4 : {
                        resTarget.res.status(400).json({ isSuccess: false, message: err[1], imgLen : null });
                        break;
                    }
                    case 5 : {
                        resTarget.res.status(500).json({ isSuccess: false, message: err[1], imgLen : null });
                        break;
                    }
                    default : {
                        break;
                    }
                }
            }catch(e) {
                console.log(`[CRITICAL][authServerModule.js][updateFace event]trying to response [${SID}], but its already sent! WTH?`);
            }
        }
        emptyRequest(SID);
    });
    authServer.on('registFace', (userId, SID, isSuccess, err, totalImgLen) => {
        const resTarget = userReqArr.getValue(SID);
        if(!resTarget)
            return console.log(`[CRITICAL][registFace eventListener][${SID}]givin SID is already fulshed!!!`);
        if(isSuccess){
            resTarget.res.status(200).json({ isSuccess: true, message: null, imgLen : totalImgLen });
        }else{
            try{
                switch(err[0]){
                    case 1 : {
                        resTarget.res.status(300).json({ isSuccess: false, message: err[1], imgLen : null });
                        break;
                    }
                    case 5 : {
                        resTarget.res.status(500).json({ isSuccess: false, message: err[1], imgLen : null });
                        break;
                    }
                    default : {
                        break;
                    }
                }
            }catch(e) {
                console.log(`[CRITICAL][authServerModule.js][registFace event]trying to response [${SID}], but its already sent! WTH?`);
            }
        }
        emptyRequest(SID);
    });
    authServer.on('registFace' ,(SID) => {
        const resTarget = userReqArr.getValue(SID);
        if(!resTarget)
            return console.log(`[CRITICAL][updateFace eventListener][${SID}]givin SID is already fulshed!!!`);
        
        resTarget.res.status(200).json({ isSuccess: true});
    });
});
