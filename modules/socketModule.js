const cv = require('opencv4nodejs');
const fs = require('fs');
const path = require('path');
let classifiers = new Array(2);
classifiers[0] = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_DEFAULT);
classifiers[1] = new cv.CascadeClassifier(cv.HAAR_EYE_TREE_EYEGLASSES);   
let myRecognizer = null;
let imageSetLabelNames = null;
setTrain(3,()=>{
    console.log('setTrain() done');
});
function setTrain(recognizerType,cb){
    readTrainSet((err,res)=>{
        if(err){//create new one
            console.log(err);
            console.log('create new one');
            createNewTrainSet(recognizerType,(err,prepRecognizer,prepLabelName)=>{
                if(err){
                    console.log(err);
                }else{
                    myRecognizer = prepRecognizer;
                    imageSetLabelNames = prepLabelName;
                    console.log('prepared recognizer set labels name list : '+imageSetLabelNames);
                }
            });
        }else{//read exist one
            console.log(`readed file is : ${res}`);
            loadTrainSet(recognizerType,res,(err,prepRecognizer)=>{
                if(err){
                    console.log(err);
                    return;
                }else{
                    myRecognizer = prepRecognizer;
                    fs.readFile('static/train/data.json',(err,data)=>{
                        if(err){
                            console.log(err);
                        }else{
                            const jsonData = JSON.parse(data);
                            let tempVar = new Array();
                            for(var i in jsonData.name){
                                tempVar.push(jsonData.name[i]);
                            }
                            imageSetLabelNames = tempVar;
                            console.log('load exist recognizer set done!')
                            console.log('prepared recognizer set labels name list : '+imageSetLabelNames);
                        }
                    });
                }
            });
        }
        cb(null);
    });
}
function readTrainSet(cb){
    fs.readdir('static/train',(err,file)=>{
        if(!err && file.length===2){
            fs.readFile(`static/train/data`,(err,res)=>{
                if(err){
                    cb(new Error('ERROR on socketModule.js setTrain() readdir ::'+err),null);
                }else{
                    cb(null,res);
                }
            });
        }else{
            cb(new Error('ERROR on socketModule.js setTrain() readdir ::'+err),null);
        }
    });
}
function createNewTrainSet(recognizerType,cb){
    const dirPath = 'userImage/';
    let dirs;
    try{
        dirs = fs.readdirSync(dirPath);
    }catch(e){
        cb(new Error(`ERROR on socketModules.js createNewTrainSet() var dirs`+e),null);
        return;
    }//여기까지 등록된 유저들의 숫자와 위치를 알았다.
    let imageSet = new Array(), labelSet = new Array();
    for(var i in dirs){
        const userPath = dirPath + dirs[i];
        const temp = readSingleUserImagesAsync(userPath,i);
        imageSet.push.apply(imageSet,temp[0]);
        labelSet.push.apply(labelSet,temp[1]);
        /*
        readSingleUserImages(userPath,i,(err,userImages,userLabels)=>{
            imageSet.push.apply(imageSet,userImages);
            labelSet.push.apply(labelSet,userLabels);
            console.log('readSingleUserImages() done')
        });
        */
        console.log('loop'+i);
    }
    //각 유저들의 내용물들을 열어서 읽는다. 읽은 갯수만큼 array를 만든다.
    
    //각 유저들의 이미지 array를 하나로 합친다, 갯수 array도 합친다.
    callRecognizer(recognizerType,imageSet,labelSet,(err,res)=>{
        if(err){
            cb(err);
        }else{
            //dir 배열을 json화 시켜 저장을 준비한다.
            let jsonFile = '{"name":[';
            for(var i in dirs){
                if(i == dirs.length-1){
                    jsonFile+=`"${dirs[i]}"]}`
                }else{
                    jsonFile+=`"${dirs[i]}",`
                }
                
            }
            fs.writeFile('static/train/data.json',jsonFile,(err)=>{
                if(err){
                    console.log(err);
                }else{
                    console.log('save done')
                }
            });
            cb(null,res,dirs);
        }
    });   
}
function loadTrainSet(recognizerType,savedData,cb){
    const dirPath = 'recognizerSet/save'
    let recognizer;
    switch(recognizerType){
        case 1: recognizer = new cv.EigenFaceRecognizer(); break;
        case 2: recognizer = new cv.FisherFaceRecognizer(); break;
        case 3: recognizer = new cv.LBPHFaceRecognizer(); break;
        default : cb(new Error('ERROR on socketModules.js callRecognizer() parameter type is out of range'),null);return;
    }
    try{
        recognizer.load('static/train/data');
        cb(null,recognizer);
    }catch(e){
        cb(new Error('ERROR on SocketModule.js loadTrainSet() recognizer file failure '+e),null);
    }
    
}
function readSingleUserImagesAsync(dir,labelNum){
    const res = fs.readdirSync(dir);
    const userImages = res.map(file=>path.resolve(dir,file))
                                    .map(filePath => cv.imread(filePath))
                                    .map(img => img.bgrToGray())
                                    .map(img => img.resize(50,50));

    let userLabels = new Array();
    for(var i in userImages){
        userLabels.push(Number(labelNum));
    }
    return [userImages,userLabels];
    
}
function readSingleUserImages(dir,labelNum,cb){
    fs.readdir(dir,(err,res)=>{
        if(!err){
            const userImages = res.map(file=>path.resolve(dir,file))
                                    .map(filePath => cv.imread(filePath))
                                    .map(img => img.bgrToGray())
                                    .map(img => img.resize(50,50));

            let userLabels = new Array(res.length);
            for(var i in userLabels){
                userLabels[i] = labelNum;
            }
            cb(null,userImages,userLabels);
        }else{
            cb(err);
        }
    });
}
function callRecognizer(type,imageSets,labelSets,cb){
    let recognizer;
    switch(type){
        case 1: recognizer = new cv.EigenFaceRecognizer(); break;
        case 2: recognizer = new cv.FisherFaceRecognizer(); break;
        case 3: recognizer = new cv.LBPHFaceRecognizer(); break;
        default : cb(new Error('ERROR on socketModules.js callRecognizer() parameter type is out of range'),null);return;
    }
    recognizer.trainAsync(imageSets,labelSets,(err)=>{
        if(err){
            cb(new Error('ERROR on socketModules.js callRecognizer() train failed ::'+err),null);
        }else{
            recognizer.save('static/train/data');
            cb(null, recognizer);
        }
    });
}
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
module.exports.authFacial = (reqId,reqImg,cb)=>{
    //img
}
    

