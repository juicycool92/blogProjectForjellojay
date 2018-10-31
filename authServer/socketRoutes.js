module.exports = (io,socketModules)=>{
    const userInfoManager = require('./modules/userInfoArr.js');
    
    var userInfoArr = new userInfoManager();
    const _REQUIRE_IMG_LEN_FOR_AUTH = 10;
    const _ERROR_DESCRIPTIONS = {
        "_NEED_MORE" : [0,"need more picture"],
        "_NO_FACIAL" : [1,"givin image cannot detect facial feature"],
        "_SERVER_ERROR" : [2,"server failed to respond"],
        "_RECOGNIZE_FAIL" : [3,"recognized failed"],
        "_UNREGISTED_USER":[4,"selected user not exist on auth server"],
        "_UNCAUGHED_ERROR" : [5]
    }
    
    io.sockets.on('connection',(socket)=>{
        console.log(`server-clioent conneted cliend id : ${socket.id}`);
        socket.on('message',(data)=>{
            userInfoArr.push(data,[]);
            console.log(userInfoArr.getObj(0));
            socket.emit('message','hello client');
        });
        socket.on('testConnection',(message,SID)=>{
            console.log(`received from web server : ${message}`);
            //socket.emit('testConnection',`fuckyou ${SID}`,SID);
        });
        socket.on('authFace',(userId,userImg,SID)=>{//이곳에서부터 요청을 처리합니다. trace 가즈아
            let curUser;
            userInfoArr.getUserBySIDasync(SID,(res)=>{//userInfoArr객체에서 loop를 돌며, SID값이 일치하는 map을 찾는다, 결과가 없으면null 있으면 curUser res
                curUser = res;
            });
            console.log(`curUser's SID [${SID}], is exist? : [${curUser}]`);//여기에서 null이 뜨면 작업queue에 등록된 유저가 없다는 말.
            
            let curUserImageLen = -1;//현제 유저가 보유한 이미지 갯수.
            if(curUser){
                 curUserImageLen = curUser.getLengthOfIMAGES();//뽑은 유저 정보에서, 이미지의 갯수를 뽑아내는 함수. 
                 console.log(`현제 가져온 userImage len : ${curUserImageLen}`); // -1이 뜨면 이 함수가 지금 문제일 확률이 있다.
                 //curUser.pushImg(userImg);
            }else{//신규 유저의 경우 이 구문을 돌것.
                 curUserImageLen = 0;
                 socketModules.detectFacial(userImg,(err,isSuccess,userMat)=>{ // 얼굴이 인식 가능한가 확인
                    if(err){//얼굴이 아니기 때문에, 이미지는 버리고, 결과를 전송한다.
                        console.log(err);
                        socket.emit('authFace',userId,SID,false,_ERROR_DESCRIPTIONS['_NO_FACIAL']);
                    }else if(isSuccess){//얼굴이지만 갯수는 한개일게 분명하니깐
                        userInfoArr.push(SID,userMat);//일단 지금 이미지와 유저정보를 저장하고,
                        socket.emit('authFace',userId,SID,false,_ERROR_DESCRIPTIONS['_NEED_MORE']);//더 추가해야한다고 알린다.
                    }else{
                        console.log(new Error(`[CRITICAL]UNCAUGHT ERROR DETECTED AT DETECTFACIAL FUNCTION`));//알수 없는 문제의 경우 이곳을 방문할 것 인데
                        socket.emit('authFace',userId,SID,false,_ERROR_DESCRIPTIONS['_SERVER_ERROR']);//이때도 그냥 에러만 알린다.
                    }
                });
            
                return; // 다른 삽질 못하게 리턴문 걸자
            }

            //유저 정보가 적어도 하나 등록 되어있는 경우는 아래의 코드를 방문할것
            if(curUserImageLen < _REQUIRE_IMG_LEN_FOR_AUTH ){ //10장 이하의 이미지가 저장된 경우
                socketModules.detectFacial(userImg,(err,isSuccess,userMat)=>{ //10장이 될때까지 추가만 하면 됨.
                    if(err){
                        socket.emit('authFace',userId,SID,false,_ERROR_DESCRIPTIONS['_NO_FACIAL']);
                    }else if(isSuccess){
                        curUser.pushImg(userMat); //얼굴이 인식되면 해당 유저의 이미지를 추가 한다.
                        socket.emit('authFace',userId,SID,false,_ERROR_DESCRIPTIONS['_NEED_MORE']);
                    }else{
                        console.log(new Error(`[CRITICAL]UNCAUGHT ERROR DETECTED AT DETECTFACIAL FUNCTION`));
                        socket.emit('authFace',userId,SID,false,_ERROR_DESCRIPTIONS['_SERVER_ERROR']);
                    }
                });
            }else if(curUserImageLen >= _REQUIRE_IMG_LEN_FOR_AUTH){ //10장 혹은 이상이 모였을 경우에 여기로
                console.log('열장 모았워요!!');
                socketModules.faceAuthWIthImages(userId,curUser.getIMAGES(),(err,isSuccess,resId)=>{ //이제 얼굴 인식을 시작한다.
                    if(err || !isSuccess){ //에러 발생시
                        err ? console.log(err) : console.log(new Error('[CRITICAL]socketModules.faceAuthWithImages() failed without error !!!'));
                        socket.emit('authFace',userId,SID,false,_ERROR_DESCRIPTIONS['_RECOGNIZE_FAIL']);
                        //완전히 인식이 시작되었고, 실패로 끝이났다. 더이상 인식 요청이 불필요하다는것을 알려줄것.
                    }else if(resId ===userId){//정확히 일치한 경우에는
                        socket.emit('authFace',userId,SID,true,null); // 성공했음을 알려준다.
                    }
                    if(!userInfoArr.pop(SID)){
                        console.log('delete usdrInfoArr is failed!!');
                    }else{
                        console.log(`usdrInfoArr [${SID}] is deleted!!`);
                    }
                });
            }else{
                //여긴 이제 들어오면 안됨. 혹시 모르니 예외처리를 
                socket.emit('authFace',userId,SID,false,_ERROR_DESCRIPTIONS['_SERVER_ERROR']);
            }
        });
           
            /*
                on emiting 'authFace' there are 4 parameters, each values are referance as like below :
                userId : who actually tryied? return as String()
                SID : requester's KEY
                isSuccess : is faceAuth success? 
                errorcode : see _ERROR_DESCRIPTIONS variable.
            */
        socket.on('updateFace',(userId,userImg,SID)=>{//이곳에서부터 이미지 업데이트 요청을 처리합니다. 
            //해당 유저가 실존하는지 확인후에
            socketModules.detectFacial(userImg,(err,isSuccess,userMat)=>{
                if(err){//얼굴이 아니기 때문에, 이미지는 버리고, 결과를 전송한다.
                    console.log(err);
                    socket.emit('updateFace',userId, SID, false,_ERROR_DESCRIPTIONS['_NO_FACIAL']);
                }else if(isSuccess){//얼굴확인
                    socketModules.isSelectedUserRegisted(userId,(err,isRegisted)=>{
                        if(!isRegisted){
                            socket.emit('updateFace',userId, SID, false,_ERROR_DESCRIPTIONS['_UNREGISTED_USER']);
                        }else{
                            socketModules.appendUserImage(userId,userMat,(err,curImgLen)=>{
                                if(err){
                                    _ERROR_DESCRIPTIONS['_UNCAUGHED_ERROR'].push(err);
                                    socket.emit('updateFace',userId, SID, false,_ERROR_DESCRIPTIONS['_UNCAUGHED_ERROR']);
                                }else{
                                    socket.emit('updateFace',userId, SID, true,null,curImgLen);
                                }
                            });
                        }
                    });
                }else{
                    console.log(new Error(`[CRITICAL]UNCAUGHT ERROR DETECTED AT DETECTFACIAL FUNCTION`));//알수 없는 문제의 경우 이곳을 방문할 것 인데
                    socket.emit('updateFace',userId, SID, false,_ERROR_DESCRIPTIONS['_SERVER_ERROR']);//이때도 그냥 에러만 알린다.
                }
            });
            //해당 이미지에서 얼굴이 식별가능한지 확인
            //유저의 이미지를 한장 추가하고,
            //총 이미지 갯수를 들고 리턴할것
        });

        socket.on('registFace',(userId,userImg,SID)=>{//이곳에서부터 요청을 처리합니다. trace 가즈아
            socketModules.detectFacial(userImg,(err,isSuccess,userMat)=>{
                if(err){//얼굴이 아니기 때문에, 이미지는 버리고, 결과를 전송한다.
                    console.log(err);
                    socket.emit('registFace',userId, SID, false,_ERROR_DESCRIPTIONS['_NO_FACIAL']);
                }else if(isSuccess){//얼굴확인
                    //이제 얼굴을 추가하는 함수를 쓰며, 등록된 갯수또한 notify 해줄것.
                    //10개가 되면, 현제 서버의 인증정보를 refresh 할것.
                    socketModules.insertUserImage(userId,userMat,(err,curImgLen)=>{
                        if(err){
                            _ERROR_DESCRIPTIONS['_UNCAUGHED_ERROR'].push(err);
                            socket.emit('registFace',userId, SID, false,_ERROR_DESCRIPTIONS['_UNCAUGHED_ERROR']);
                        }else{
                            socket.emit('registFace',userId, SID, true,null,curImgLen);
                        }
                    });
                }else{
                    console.log(new Error(`[CRITICAL]UNCAUGHT ERROR DETECTED AT DETECTFACIAL FUNCTION`));//알수 없는 문제의 경우 이곳을 방문할 것 인데
                    socket.emit('registFace',userId, SID, false,_ERROR_DESCRIPTIONS['_SERVER_ERROR']);//이때도 그냥 에러만 알린다.
                }
            });
        });
        socket.on('pushFaceInfo',(SID)=>{//authServer에게 업데이트를 요청합니다.
            socketModules.pushFaceInfo();
            socket.emit('pushFaceInfo',SID);
        });
    });
}