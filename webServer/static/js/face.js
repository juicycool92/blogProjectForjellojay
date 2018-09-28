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
        "LOGIN":0,"SIGN":1,"FACEAUTH":2
    }
};
const _BTN = {
    "COLOR" : {
        "BLUE" : "btn-primary",
        "GRAY" : "btn-secondary",
        "GREEN" : "btn-success",
        "RED" : "btn-danger",
        "YELLOW" : "btn-warning",
        "CYAN" : "btn-info",
        "WHITE" : "btn-light",
        "BLACK" : "btn-dark",
        "LINK" : "btn-link"
    },
    "LENGTH" : 9
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
                    return true;
                   
                }
            }).catch(e =>{
                switch(e.name){
                    case "NotAllowedError":{
                        alertSetting(_ALERT.TYPE.FACEAUTH,true,_ALERT.STATUS.FALSE,"You must allow cam for Face Auth");
                        break;
                    }
                    default : {
                        alertSetting(_ALERT.TYPE.FACEAUTH,true,_ALERT.STATUS.FALSE,"Unknown error!!!");
                        break;
                    }
                }   
                return false;
            });
        video.setAttribute("playsinline", true);
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
