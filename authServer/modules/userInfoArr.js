var userInfoArray = module.exports = function(){
    this.element = new Array();
    this.EXPLIMIT = 120000;
}
userInfoArray.prototype = {
    push : function(uSID,uImgs){
        //push userObj array into this element. require userObj object.
        this.element.push(new userObj(uSID,uImgs));
        for(var i in this.element){
            console.log(this.element[i].getLengthOfIMAGES());
        }
    },
    pop : function(uSID){
        try{
            const index = this.element.indexOf(uSID);
            this.element.splice(index,1);
            return true;
        }catch(e){
            return false;
        }
    },
    getObj : function(index){
        //return userObj which is indexing in this array. require int type.
        if( index < this.element.length && index > -1){
            return this.element[index];
        }else{
            throw new Error(`index is out of array range.`);
        }
    },
    expireCheck : function(curDate){
        //check and clear useless userObj object what is outdated.
        //expire time can change by setSETDATE(int millisecond).
        var nCount = 0;
        for(var i = 0 ; i < this.element.length ; i ++){
            if(curDate.getTime() - this.element[i].getSETDATE().getTime() > this.EXPLIMIT ){
                this.element.pop(i);
                nCount += 1;
            }
        }    
        return `total ${nCount} item's are expired`;
    },
    setSETDATE : function(setmillisecond){
        this.SETDATE = setmillisecond;
    },
    getUserBySIDasync : function(SID,cb){
        console.log('current element size : '+this.element.length)
        for(var i in this.element){
            console.log(`looping ${i}`);
            if(this.element[i].getSID() == SID){
                console.log('its matching!!!')
                return cb(this.element[i]);
            }
        }
        console.log('no match found')
        return cb(null);
    },
    getUserBySID : function(SID){
        console.log('여기 들어오긴 하나?')
        this.element.forEach((value, index, arr)=>{
            console.log('포이치 getUserBySID 가 돌긴 하냐');
            console.log(`${value.getSID()} :: ${SID}`);
            if(value.getSID() === SID){
                return value;
            }
                
        });
        return null;
    }
}

function userObj(uSID,uImgs){
    //uSID is string, uImages are arary type.
    this.SID = uSID;
    this.SETDATE = new Date();
    this.IMAGES = new Array();
    console.log('userObj가 생성이 되면 여기에 올것.')
    this.IMAGES.push(uImgs);
    // for(var i = 0 ; i < uImgs.length ; i ++){
    //     console.log('이미지 추가됨')
    //     this.IMAGES.push(uImgs[i]);
    // }
    //이 부분은 문제가 있으므로..현제 설계는 uImgs를 단 한장만 받아오고 있다!!!
}

userObj.prototype = {
    getSID : function(){
        //return SID
        return this.SID;
    },
    getSETDATE : function(){
        //return SETDATE as Date() type.
        return this.SETDATE;
    },
    getIMAGES : function(){
        //return array of images. its base64 type normally.
        return this.IMAGES;
    },
    getLengthOfIMAGES : function(){
        return this.IMAGES.length;
    },
    pushImg: function(img){
        //push new base64 image into IMAGES array.
        //return true / false in result of insert.
        if(this.IMAGES.push(img)){
            this.SETDATE = new Date();
            return true;
        }else{
            return false;
        }
    },
    refreshSETDATE : function(){
        this.SETDATE = new Date();
    }
}
    
    

/*
function userInfoArray(){
    this.element = new Array();
    this.EXPLIMIT = 30000;
}
    
userInfoArray.prototype = {
    push : function(uSID,uImgs){
        //push userObj array into this element. require userObj object.
        this.element.push(new userObj(uSID,uImgs))
    },
    getObj : function(index){
        //return userObj which is indexing in this array. require int type.
        if( index < element.length && index > -1){
            return this.element[index];
        }else{
            throw new Error(`index is out of array range.`);
        }
    },
    expireCheck : function(curDate){
        //check and clear useless userObj object what is outdated.
        //expire time can change by setSETDATE(int millisecond).
        var nCount = 0;
        for(var i = 0 ; i < this.element.length ; i ++){
            if(curDate.getTime() - this.element[i].getSETDATE().getTime() > this.EXPLIMIT ){
                this.element.pop(i);
                nCount += 1;
            }
        }    
        return `total ${nCount} item's are expired`;
    },
    setSETDATE : function(setmillisecond){
        this.SETDATE = setmillisecond;
    }
}
function userObj(uSID,uImgs){
    //uSID is string, uImages are arary type.
    this.SID = uSID;
    this.SETDATE = new Date();
    this.IMAGES = new Array();
    for(var i = 0 ; i < uImgs.length ; i ++){
        this.IMAGES.push(uImgs[i]);
    }
}
userObj.prototype = {
    getSID : function(){
        //return SID
        return this.SID;
    },
    getSETDATE : function(){
        //return SETDATE as Date() type.
        return this.SETDATE;
    },
    getIMAGES : function(){
        //return array of images. its base64 type normally.
        return this.IMAGES;
    },
    pushImg: function(img){
        //push new base64 image into IMAGES array.
        //return true / false in result of insert.
        if(this.IMAGES.push(img))
            return true;
        else
            return false;
    }
}
    
    

*/