module.exports = (app,io,socketModule,User) =>{
    io.on('connection',(socket)=>{
        console.log('io on connection ')
        let nCount = 0;
        let facesRect = [];
        let userPic = 0;
        let authImages = new Array();
        socket.on('uploadMyImage',(image,userId)=>{
            console.log('visit here?')
            User.findOne(userId,(err,id)=>{
                if(err){
                    console.log(err);
                }else if(id.userid === userId){
                    // userId is valid, now start upload user image from here.
                    socketModule.addUserImage(userId,image,(err)=>{
                        if(err){
                            console.log(err);
                        }else{
                            console.log('add face successfully')
                        }
                    });
                }else{
                    console.log('CRITICAL error on socketRoutes, User, findOne');
                }
  
            });
        });
        socket.on('registMyImage',(image,userId)=>{
            socketModule.registUserImage(image,userId,(err,errcode)=>{
                if(err){
                    console.log(`user ${userId} regist failed`);
                    socket.emit('registMyImage',false,errcode);
                }else if(errcode){
                    console.log(`user ${userId} regist failed:${errcode}`);
                    socket.emit('registMyImage',false,errcode);
                }else{
                    socketModule.retrainRecognizer((res)=>{
                        console.log(`user ${userId} regist success`);
                        socket.emit('registMyImage',true);
                    });
                    
                }
            });
            //user img registeration socket emitter.
            //will repeat until userPic < 10 or 
        })
        socket.on('findUser',(reqId)=>{
            //여기서 reqId가 있는지 추후에는 검사하도록 한다. 일단은 무조건 되게 하자.
            
        });
        socket.on('facialAuth',(reqId,img)=>{
            User.findOne(reqId,(err,id)=>{
                if(err){
                    console.log(err);
                }else if(id.userid === reqId){
                    //console.log(`[LOG]finduser(${reqId}) done, proceed to socketModule.authFacial()`)
                    socketModule.authFacial(reqId,img,(err,bIsSuccess,resId,totalCurUserImgLen)=>{
                        if(err){
                            console.log(`[ERROR] on socketModule.authFacial() :: ${err}`);
                        }else if(!bIsSuccess){
                            console.log(`[INFO] authFacial false`);
                        }else if(totalCurUserImgLen < 9){
                            console.log(`[INFO]require more image, cur image length : ${totalCurUserImgLen}`);
                        }else{
                            console.log('[SUCCESS]detectingfacial success')
                        }
                    })
                }else{
                    console.log('CRITICAL error on socketRoutes, User, findOne');
                }
            });
        });//인증 시도 부분
        socket.on('detectFacial',(img)=>{
            console.log('heyyy')
            socketModule.detectFacial(img,(err,bIsSuccess)=>{
                if(err){
                    console.log(bIsSuccess,' :: ',err);
                    socket.emit('detectFacialRes',bIsSuccess,null);
                }else{
                    socket.emit('detectFacialRes',bIsSuccess,img);
                }
            });
        });//해당 얼굴이 인식가능한 얼굴인지 여부, 맞으면 인식에 성공한 원본 img를 다시 돌려줄것.
    });
}