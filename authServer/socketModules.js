const cv = require('opencv4nodejs');
const fs = require('fs');
const path = require('path');
const myRecognizerType ={"_EIGEN_RECOGNIZER":1,"_FISHERFACE_RECOGNIZER":2,"_LBPH_RECOGNIZER":3};
const _MAXIMUM_CONFIDENCE_VALUE = 140;
//this is recognizer map, for selecting recognizer, call myRecognizerType["_WHAT_EVER_YOU_WANT"]
const classifiers = [new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_DEFAULT), new cv.CascadeClassifier(cv.HAAR_EYE_TREE_EYEGLASSES)];
//this classifiers variable is face and eye detecting classifier. in case of using diffirence classifier, you have to modify function"""
let myRecognizer = null;//this is recognizer. 
let imageSetLabelNames = null; //this array is for recognizer's labels name.
var curUserImages = new Array(); //this array is using with create new user.

const pushScheduler = require('./modules/pushScheduler.js');
const pushManager = new pushScheduler();

const setTrain = (recognizerType,cb)=>{//this function is for trainset. usually called in when this script created.
    readTrainSet((err,res)=>{
        if(err){//if TrainSet is not Exist!
            console.log('[WARN]no Trainset found!! is it first server run? creating new one');
            createNewTrainSet(recognizerType,(err,prepRecognizer,prepLabelName)=>{
                if(err){
                    console.log(err);
                    cb(err);
                    return;
                }else{
                    myRecognizer = prepRecognizer;
                    imageSetLabelNames = prepLabelName;
                    console.log('prepared recognizer set \nprepared labels name list : '+imageSetLabelNames);
                }
            });
        }else{//if TrainSet is exist,
            loadTrainSet(recognizerType,res,(err,prepRecognizer)=>{
                if(err){    //if failed to load Trainset via selected recognizer,
                    console.log(err);
                    cb(err);
                    return;
                }else{  //if success to load Trainset via selected recognizer,
                    myRecognizer = prepRecognizer;  //save recognizer as global.
                    fs.readFile('static/train/data.json',(err,data)=>{  //read label actual name from data.json
                        if(err){
                            console.log(err);
                            cb(err);
                            return;
                        }else{
                            const jsonData = JSON.parse(data);
                            let tempVar = new Array();
                            for(var i in jsonData.name){
                                tempVar.push(jsonData.name[i]);
                            }
                            imageSetLabelNames = tempVar;//save to global value.
                            tempVar = null; //free array
                            console.log('load exist recognizer set done!')
                            console.log('prepared recognizer set labels name list : '+imageSetLabelNames);
                        }
                    });
                }
            });
        }
        cb(null);
        return;
    });
}

const readTrainSet = (cb)=>{ //this function is read trainSetfile with fs. returning (err,array)
    fs.readdir('static/train',(err,file)=>{
        if(!err && file.length===2){
            fs.readFile(`static/train/data`,(err,res)=>{
                if(err){
                    cb(new Error('ERROR on socketModule.js setTrain() readdir ::'+err),null);
                }else{
                    cb(null,res);
                }
                return;
            });
        }else{
            cb(new Error('ERROR on socketModule.js setTrain() readdir ::'+err),null);
            return;
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
        if(err){
            return cb(err,null);
        }else{
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
}//(targetVector2d,dstVector2d) as parameter, return bool as if target Vec2d is inside of dst Vec2d
const facialDetect = (originalImage,cb)=>{  //(원본이미지)as parameter, retrun as(err,detectedMat area)
    if(!originalImage){
        cb(new Error('ERROR on socketModules.js facialDetect() : image parameter is NULL!! exit func'),null);
    }else{
        const base64Image = originalImage.replace('data:image/png;base64','');
        const buf = Buffer.from(base64Image,'base64')
        const userCvImage = cv.imdecode(buf);
        const gray = userCvImage.bgrToGray();
        //cv.imshowWait('debug',gray);
       // cv.destroyAllWindows();
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

const recognizeImage = (reqImg,reqId,cb)=>{
    myRecognizer.predictAsync(reqImg,(err,res)=>{
        if(err){
            cb(err,null);
        }else{
            console.log(`[LOG]reqImg find success. label is ${imageSetLabelNames[res.label]} , confidence is ${res.confidence}`);
            cb(null,imageSetLabelNames[res.label]);
        }
    });
}
const recognizeMultipleImage = (reqId,reqImgArr,cb)=>{
    var resultSets = new Array();
    for(var i in reqImgArr){
        console.log('야');
        cv.imshow(`img[${i}]`,reqImgArr[i]);
    }
    cv.waitKey();
    cv.destroyAllWindows();
    console.log(`givin reqId is ${reqId}, lets start recognize`);
    for(var i in reqImgArr){
        const res = myRecognizer.predict(reqImgArr[i]);
        console.log(`recognizer No${i}. ${res.label} == ${imageSetLabelNames[res.label]}? .. and ${res.confidence}`);
        if(imageSetLabelNames[res.label] === reqId && res.confidence < _MAXIMUM_CONFIDENCE_VALUE){
            resultSets.push(true);
        }else{
            resultSets.push(false);
        }
        
    }
    return cb(resultSets);
}
const recognizeMultipleImageOld = (reqId,cb)=>{
    var resultSets = new Array();
    for(var i in curUserImages){
        const res = myRecognizer.predict(curUserImages[i]);
        console.log(res);
        if(imageSetLabelNames[res.label] === reqId && res.confidence < 140){
            resultSets.push(true);
        }else{
            resultSets.push(false);
        }
        /*
        myRecognizer.predictAsync(curUserImages[i],(err,res)=>{
            if(err){
                resultSets.push(false);
            }else if(imageSetLabelNames[res.label] === reqId){
                resultSets.push(true);
            }else{
                resultSets.push(false);
            }
        });
        */
    }
    console.log(`result : ${resultSets}`)
    cb(resultSets);
}
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
    facialDetect(userImage,(err,matImg)=>{
        if(err){
            cb(err,false);
            return;
        }
        cb(null,true,matImg);
    });
}
const clearArray = (selectedArray)=>{
    while(selectedArray.length){
        selectedArray.pop();
    }
};
module.exports.faceAuthWIthImages = (reqId,reqImgArr,cb)=>{
    console.log(`야 이 시${reqId}`);
    recognizeMultipleImage(reqId,reqImgArr,(resSets)=>{
        console.log(`raw array : ${resSets}`);
        const result = resSets.filter(res =>res == true );
        console.log(`filtered array : ${result}`);
        if(result.length > 6){
            cb(null,true,reqId);
        }else{
            cb(new Error(`[ERROR]failed to recognize this person! total testcase
             is ${reqImgArr.length}, successs testcase length is ${result.length}`)
             ,false,null);
        }
    });
    //return err isSuccess resId;
}
module.exports.authFacial = (reqId,reqImg,cb)=>{    //param(요청자id,요청자img),return as(err,isSuccess,resId,totalCurUserImgLen)
    //얼굴을 인식하는가, 인식된mat을 반환
    facialDetect(reqImg,(err,reqImgMat)=>{
        if(err){
            cb(err,false);
            return;
        }else{
            curUserImages.push(reqImgMat);
            if(curUserImages.length < 10 ){
                cb(null,true,null,curUserImages.length);
                return;
            }
            recognizeMultipleImageOld(reqId,(resSets)=>{
                const result = resSets.filter(res =>res == true );
                console.log('hey!'+result);
                if(result.length > 6){
                    cb(null,true,reqId);
                }else{
                    cb(new Error(`[ERROR]failed to recognize this person! total testcase
                     is ${curUserImages.length}, successs testcase length is ${result.length}`)
                     ,false,null,curUserImages.length);
                }
                clearArray(curUserImages);
            });
            /*
            recognizeImage(reqImgMat,reqId,(err,res)=>{
                if(err)
                    cb(err,false)
                else
                    cb(null,true,res);
            });
            */
        }
    });
    //이 얼굴이 데이터베이스에 있는가
    //결과반환
}
const getUserImageLength = (dir)=>{
    const res = fs.readdirSync(dir);
    return res.length;
}

module.exports.registUserImage = (userImage,userId,cb)=>{
    const userImageLoc = `userImage/${userId}`;
    const errcode = {"_DETECT_FAILED":0,"_NEED_MORE_IMAGE":1,"_UNCAUGHTERROR":2};
    let userCvImage = null;
    facialDetect(userImage,(err,userCvImages)=>{
        if(err){
            cb(err,errcode["_DETECT_FAILED"]);
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
                    return;
                }else{
                    imageAdd(userImageLoc,userCvImage,(err)=>{
                        if(err){
                            cb(err,errcode["_UNCAUGHTERROR"]);
                            return;
                        }
                        cb(null,errcode["_NEED_MORE_IMAGE"]);
                        return;
                    });
                }
            });
        }else{//이미 폴더는 있는상태, 이미지가 10개 이상인지 확인하고, 이상이다면 err반환, 아니라면 작업
            curLen= getUserImageLength(userImageLoc);
            if(curLen > 10){
                cb(new Error(`User ${userId} already registed`));
                return;
            }
            imageAdd(userImageLoc,userCvImage,(err)=>{
                if(err){
                    cb(err);
                    return;
                }
                if(curLen+1 > 10)
                    cb(null);
                else
                    cb(null,errcode["_NEED_MORE_IMAGE"]);
                return;
            });
        }
    });
};
module.exports.retrainRecognizer = (cb)=>{
    createNewTrainSet(myRecognizerType["_LBPH_RECOGNIZER"],(err,prepRecognizer,prepLabelName)=>{
        if(err){
            console.log(err);
        }else{
            myRecognizer = prepRecognizer;
            imageSetLabelNames = prepLabelName;
            console.log('prepared recognizer set labels name list : '+imageSetLabelNames);
        }
    });
};
const isUserFolderExist = (userImageLoc,cb)=>{
    fs.readdir(userImageLoc,(err)=>{
        if(err){
            return cb(err,false);
        }
        return cb(null,true);
    });
}//this function is checking directory if its exist or not, callback(error,isSuccess?)

module.exports.isSelectedUserRegisted = (userId,cb)=>{
    const userImageLoc = `userImage/${userId}`;
    isUserFolderExist(userImageLoc,(err,isExist)=>{
        if(!isExist){
            console.error("isSelectedUserRegisted()에서 에러 발생? "+err);
            return cb(err,false);
        }
        console.log('its exist')
        return cb(null,true)
    });
}

module.exports.appendUserImage = (userId,userCvImage,cb)=>{
    
    const userImageLoc = `userImage/${userId}`;
    const curLen= Number.parseInt(getUserImageLength(userImageLoc));
    imageAdd(userImageLoc,userCvImage,(err)=>{
        if(err){
            cb(err,null);
        }else{
            cb(null,curLen+1);
        }
        return;
    });
}
const createNewFolder = (userImageLoc,cb)=>{
    fs.mkdir(userImageLoc,(err)=>{
        if(err){
            cb(new Error('ERROR on socketModule.js createNewFolder() fs.mkdir() failed ::'+err),false);
        }else{
            cb(null,true);
        }
        return;
    });
}
module.exports.insertUserImage = (userId,userCvImage,cb)=>{
    const userImageLoc = `userImage/${userId}`;
    isUserFolderExist(userImageLoc,(err,isExist)=>{
        if(!isExist){
            //create new folder and
            //inser image
            createNewFolder(userImageLoc,(err,isSuccess)=>{
                if(err){
                    cb(err);
                }else{
                    imageAdd(userImageLoc,userCvImage,(err)=>{
                        if(err){
                            cb(err,null);
                        }else{
                            cb(null,1);
                        }
                        return;
                    });
                }
            });
        }else{
            const curLen= Number.parseInt(getUserImageLength(userImageLoc));
            imageAdd(userImageLoc,userCvImage,(err)=>{
                if(err){
                    cb(err,null);
                }else{
                    cb(null,curLen+1);
                }
                return;
            });
        }
        return;
    });
}//this function is for first registed user, which mean, its same function as above appendUserImage(), but create new folder is quite diff
module.exports.pushFaceInfo = ()=>{
    if(!pushManager.getIsBusy()){ 
        pushManager.startPush();
        createNewTrainSet(myRecognizerType["_LBPH_RECOGNIZER"],(err)=>{ 
            if(err){
                console.log(`[CRITICAL] preparing recognizer from setTrain() FAILED!!! SERVER STOP!!!`);
                throw new Error('server has blocked');
            }else{
                setTrain(myRecognizerType["_LBPH_RECOGNIZER"],(err)=>{ //this is called when this module called.
                    if(err){
                        console.log(`[CRITICAL] preparing recognizer from setTrain() FAILED!!! SERVER STOP!!!`);
                        throw new Error('server has blocked');
                    }else{
                        pushManager.freeScheduler();
                    }
                });
            }
        });
    }else{
        console.log(`[socketModule.js][pushFaceInfo][WARN] push request sent at ${new Date().getTimezoneOffset()} but its still progressing, IGNORED`);
    }
    //check its already pushing
    //mark as pushing
    //pushing
    //when its done, remark it.
}
setTrain(myRecognizerType["_LBPH_RECOGNIZER"],(err)=>{ //this is called when this module called.
    if(err){
        console.log(`[CRITICAL] preparing recognizer from setTrain() FAILED!!! SERVER STOP!!!`);
        throw new Error('server has blocked');
    }
});