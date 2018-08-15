module.exports = (app,io,socketModule,User) =>{
    console.log(socketModule);
    io.on('connection',(socket)=>{
        console.log('io on connection ')
        let nCount = 0;
        let facesRect = [];
        let userPic = 0;
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
        socket.on('registUserImg',(image)=>{
            //user img registeration socket emitter.
            //will repeat until userPic < 10 or 
        })
        socket.on('findUser',(reqId)=>{
            //여기서 reqId가 있는지 추후에는 검사하도록 한다. 일단은 무조건 되게 하자.
            
        });
        socket.on('faceAuth2',(reqId,img)=>{
            
        });//두번쨰 테스트.
        socket.on('detectFacial',(img)=>{
            console.log('heyyy')
            socketModule.detectFacial(img,(err,bIsSuccess)=>{
                if(err){
                    console.log(err);
                    socket.emit('detectFacialRes',bIsSuccess,null);
                }else{
                    socket.emit('detectFacialRes',bIsSuccess,img);
                }
            });
        });//해당 얼굴이 인식가능한 얼굴인지 여부, 맞으면 인식에 성공한 원본 img를 다시 돌려줄것.
    });
}