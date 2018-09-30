const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
let mediaDevices;   
//this letiable are bind to mediaDevices from $().init() it's control webcam status. 
let constraints;
let video;
const _ALERT = { 
    "STATUS" : {
        "TRUE":"alert-success","FALSE":"alert-danger","INFO":"alert-info"
    },
    "TYPE" : {
        "LOGIN":0,"SIGN":1,"FACEAUTH":2,"FACEAPPEND":3
    }
};
const _BTN = {
    COLOR : {
        BLUE : "btn-primary",
        GRAY : "btn-secondary",
        GREEN : "btn-success",
        RED : "btn-danger",
        YELLOW : "btn-warning",
        CYAN : "btn-info",
        WHITE : "btn-light",
        BLACK : "btn-dark",
        LINK : "btn-link"
    },
    NAME : {
        UPDATE :'btn_updateFaceAuth',
        REGIST : 'btn_registFaceAuth',
        TOGGLE_UPDATE : 'btn_toggleUpdate',
    },
    LENGTH : 9
}
const _MSG = {
    UPDATEFACE : "face camera!",
    CAMAUTHFAILED : "camera is not ready or permission not grant!",
    UPDATESTOPPED : "update stopped"
}
function deleteAlertClass(targetObject){
    if(targetObject.classList.contains(_ALERT.STATUS.TRUE)){
        targetObject.classList.remove(_ALERT.STATUS.TRUE);
    }
    if(targetObject.classList.contains(_ALERT.STATUS.FALSE)){
        targetObject.classList.remove(_ALERT.STATUS.FALSE);
    }
    if(targetObject.classList.contains(_ALERT.STATUS.INFO)){
        targetObject.classList.remove(_ALERT.STATUS.INFO);
    }
}
function alertSetting(alertType = null, isVisiable = false, status = _ALERT.STATUS.FALSE, message = null,target = null,targetMsg = null){
    switch(alertType){
        case _ALERT.TYPE.LOGIN : {
            deleteAlertClass(loginSign[0]);                
            loginSign[0].classList.add(status);
            isVisiable ? ( loginSign[0].classList.contains('in') ? null : loginSign[0].classList.add('in') ) : ( loginSign[0].classList.contains('in') ? loginSign[0].classList.remove('in') : null );
            if(message){
                loginSign[1].innerText = message;
            }
            break;
        }
        case _ALERT.TYPE.SIGN : {
            deleteAlertClass(signSign[0]);                
            signSign[0].classList.add(status);
            isVisiable ? ( signSign[0].classList.contains('in') ? null : signSign[0].classList.add('in') ) : ( signSign[0].classList.contains('in') ? signSign[0].classList.remove('in') : null );
            if(message){
                signSign[1].innerText = message;
            }
            break;
        }
        case _ALERT.TYPE.FACEAUTH : {
            deleteAlertClass(authSign[0]);                
            authSign[0].classList.add(status);
            isVisiable ? ( authSign[0].classList.contains('in') ? null : authSign[0].classList.add('in') ) : ( authSign[0].classList.contains('in') ? authSign[0].classList.remove('in') : null );
            if(message){
                authSign[1].innerText = message;
            }
            break;
        }
        case _ALERT.TYPE.FACEAPPEND : {
            target.classList.add(status);
            isVisiable ? ( target.classList.contains('in') ? null : target.classList.add('in') ) : ( target.classList.contains('in') ? authSign[0].classList.remove('in') : null );
            if(message){
                targetMsg.innerText = message;
            }
            break;
        }
        default : {
            throw new Error('[ERROR] alertType is null, wrong args givin');
        }
    }
}
function alertToggle(isVisiable,alertId){
    if(isVisiable==true){
        document.getElementById(''+alertId+'').classList.add('in') ;
    }else if(isVisiable==false){
        document.getElementById(''+alertId+'').classList.remove('in') ;
    }else if(isVisiable==null){
        if(document.getElementById(''+alertId+'').classList.contains('in')){
            document.getElementById(''+alertId+'').classList.remove('in') ;
        }else{
            document.getElementById(''+alertId+'').classList.add('in') ;
        }
    }
}

const getheringCurImage = ()=>{
    context.drawImage(video,0,0,context.width,context.height);
    return canvas.toDataURL('image/webp');
};
const setBtnColor = (btn,target,dest)=>{
    if(!dest){
        for(let i = 0 ; i < _BTN.LENGTH; i++){
            if(btn.classList.contains()){
                
            }
        }
    }else{

    }
}
$(function(){
    $.fn.killCam = ()=>{
        if(!mediaDevices){
            mediaDevices=null;
        }else{
            mediaDevices.getVideoTracks()[0].stop();
            mediaDevices=null;
        }
    }
    $.fn.initCam = (selectedVideo)=>{
        video = selectedVideo;
        constraints = {
            video : {
                width : 640
            }
        };

        navigator.mediaDevices.getUserMedia(constraints)
            .then(mediaStream=>{
                mediaDevices = mediaStream;
                video.srcObject = mediaStream;
                video.onloadedmetadata = e =>{ 
                    video.style.width = video.videoWidth+"px";
                    video.style.height = video.videoHeight+"px";
                    canvas.width = video.videoWidth;
                    context.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    context.height = video.videoHeight;
                    video.play();
                    const sendImg = getheringCurImage();
                    video.setAttribute("playsinline", true);
                    return true;
                   
                }
            }).catch(e =>{
                switch(e.name){
                    case 'NotAllowedError':{
                        alert(e);
                        alertSetting(_ALERT.TYPE.FACEAUTH,true,_ALERT.STATUS.FALSE,"You must allow cam for Face Auth");
                        break;
                    }
                    case 'NotFoundError' : {
                        alert('NO CAMERA DETECTING');break;
                    }
                    default : {
                        alert(e);
                        alertSetting(_ALERT.TYPE.FACEAUTH,true,_ALERT.STATUS.FALSE,"Unknown error!!!");
                        break;
                    }
                }   
                return false;
            });
//        video.setAttribute("playsinline", true);
    };

    $.fn.ajaxCall_faceAuth = (userId,userImg)=>{
        if(!mediaDevices){
            return console.log(`in ajax call function ${mediaDevices} therefore function stop`);
        }
        userImg = getheringCurImage();
        console.log('ajax call face auth is activated ::'+userImg)
        $.ajax({
            type : "POST",
            url : "/authFace",
            data : {
                "userId" : userId,
                "userImg" : userImg
            },
            dataType : "JSON",
            success : (data)=>{
                console.log('SUCCESS!!!')
                alertSetting(_ALERT.TYPE.FACEAUTH,true,_ALERT.STATUS.TRUE,"auth Successfully");
                $(this).loginMenuManager(true,userId);
                $("#LoginModal .close").click();
                $("#FaceAuthModal .close").click();
            },
            statusCode : {                    
                300 : (data)=>{
                    console.log(`300 code ${data}`);
                    $(this).ajaxCall_faceAuth(userId,userImg);
                },
                401 : (data)=>{
                    alertSetting(_ALERT.TYPE.FACEAUTH,true,_ALERT.STATUS.FALSE,"faceAuth failed");
                    console.log(`401 code ${data}`);
                    return;
                },
                412 : (data)=>{
                    console.log(`412 code ${data}`);
                    return;
                },
                500 : (data)=>{
                    console.log(`500 code ${data}`);
                    alertSetting(_ALERT.TYPE.FACEAUTH,true,_ALERT.STATUS.FALSE,"server error 500");
                    return;
                },
                503 : (data)=>{
                    console.log(`503 code ${data}`);
                    alertSetting(_ALERT.TYPE.FACEAUTH,true,_ALERT.STATUS.FALSE,"request timeout!");
                    return;
                },
            },
            error : (data)=>{
                console.log(`err ${data.status}`);
                return;
            }
        });
    };

    

});
