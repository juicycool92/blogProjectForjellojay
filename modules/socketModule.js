const cv = require('opencv4nodejs');
const fs = require('fs');
let classifiers = new Array(2);
classifiers[0] = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_DEFAULT);
classifiers[1] = new cv.CascadeClassifier(cv.HAAR_EYE_TREE_EYEGLASSES);   

const imageAdd = (imageLocation,image,cb)=>{
    let fileSize = 0;
    fs.readdir(imageLocation,(err,lists)=>{
        if(!err){
            fileSize = lists.length;
        }
        const filename =("000" + fileSize).slice(-3);
    
        cv.imwriteAsync(`${imageLocation}/${filename}.jpg`,image,(err)=>{
            if(err){
                cb(new Error(`ERROR on imageAdd() :  ${err}`));
                return;
            }
            cb(null);
        });
    });
    

};
const isTargetRectisInsideOfDstRect = (targets,dst,cb)=>{
    for(var i in targets){
        if( ! ( (targets[i].x < dst.x || targets[i].x + targets[i].width < dst.x + dst.width) && 
                ( targets[i].y < dst.y || targets[i].y + targets[i].height < dst.y + dst.height ) ) ){
                    cb(false);
                    return;
                }
    }
    cb(true);
}
const facialDetect = (originalImage,cb)=>{
    if(!originalImage){
        cb(new Error('ERROR on socketModules.js facialDetect() : image parameter is NULL!! exit func'),null);
    }else{
        const base64Image = originalImage.replace('data:image/png;base64','');
        const buf = Buffer.from(base64Image,'base64')
        const userCvImage = cv.imdecode(buf);
        const gray = userCvImage.bgrToGray();
        //cv.imshowWait('debug',gray);
        //cv.destroyAllWindows();
        const faceRects = classifiers[0].detectMultiScale(gray).objects;
        if(!faceRects.length){
            cb('INFO on socketModules.js facialDetect() : selected image is not detected face, abroated',null);
            return; 
        }
        const eyeRects = classifiers[1].detectMultiScale(gray).objects;
        if(!eyeRects.length){
            cb('INFO on socketModules.js facialDetect() : selected image is not detect eye(s),abroated',null);
            return;
        }else{
            isTargetRectisInsideOfDstRect(eyeRects,faceRects[0],(isTrue)=>{
                if(!isTrue){
                    cb('INFO on socketModules.js facialDetect() : selected image is failed  to detect right face and eye(s), abroated',null);
                    return;
                }
                cb(null,gray.getRegion(faceRects[0]));
            });
        }
    }
};

module.exports.addUserImage=(userId,userImage,cb)=>{
    console.log('visite hereeee')
    const userImageLoc = `userImage/${userId}`;
    let userCvImage = null;
    facialDetect(userImage,(err,userCvImages)=>{
        if(err){
            cb(err);
            return;
        }
        userCvImage = userCvImages;
        console.log('log:: success detected');
    });
    fs.access(userImageLoc,fs.constants.F_OK,(err)=>{
        if(err){
            fs.mkdir(userImageLoc,(err)=>{
                if(err){
                    cb(new Error('ERROR on socketModule.js addUserImage() fs.mkdir() failed ::'+err));
                }else{
                    imageAdd(userImageLoc,userCvImage,(err)=>{
                        if(err){
                            cb(err);
                            return;
                        }
                        cb(null);
                    });
                }
            });
        }else{
            imageAdd(userImageLoc,userCvImage,(err)=>{
                if(err){
                    cb(err);
                    return;
                }
                cb(null);
            });
        }
    });
}
module.exports.detectFacial = (userImage,cb)=>{
    facialDetect(userImage,(err)=>{
        if(err){
            cb(err,false);
            return;
        }
        cb(null,true);
    });
}
module.exports.test = ()=>{
    console.log('test func')
}
    

