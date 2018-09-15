//currently this code is not used
var userInfoArray = module.exports = function(){
    this.element = new Array();
    this.EXPLIMIT = 30000;
}

/*
function userInfoArray(){
    this.element = new Array();
    this.EXPLIMIT = 30000;
}
  */  
userInfoArray.prototype = {
    push : function(uUid,uImgs){
        //push userObj array into this element. require userObj object.
        this.element.push(new userObj(uUid,uImgs))
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
    }
}

function userObj(uUid,uImgs){
    //uUid is string, uImages are arary type.
    this.UID = uUid;
    this.SETDATE = new Date();
    this.IMAGES = new Array();
    for(var i = 0 ; i < uImgs.length ; i ++){
        this.IMAGES.push(uImgs[i]);
    }
}

userObj.prototype = {
    getUID : function(){
        //return UID
        return this.UID;
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
    
    

/*
function userInfoArray(){
    this.element = new Array();
    this.EXPLIMIT = 30000;
}
    
userInfoArray.prototype = {
    push : function(uUid,uImgs){
        //push userObj array into this element. require userObj object.
        this.element.push(new userObj(uUid,uImgs))
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
function userObj(uUid,uImgs){
    //uUid is string, uImages are arary type.
    this.UID = uUid;
    this.SETDATE = new Date();
    this.IMAGES = new Array();
    for(var i = 0 ; i < uImgs.length ; i ++){
        this.IMAGES.push(uImgs[i]);
    }
}
userObj.prototype = {
    getUID : function(){
        //return UID
        return this.UID;
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