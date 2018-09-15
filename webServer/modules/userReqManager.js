//this scripts are support user request / response who trying to face auth.
//for using this script, import file and declare dynamicly.

var useReqManager = module.exports = function(){
    this.reqMap = new Map();
    this.EXPLIMIT = 1000;
}
useReqManager.prototype = {
    map : function(){return this.reqMap},
    expireCheck : function(curDate){
        let nCount = 0;
        this.reqMap.forEach((value,key,reqMap) => {
            if(curDate.getTime() - value.REGISTEDDATE.getTime() > this.EXPLIMIT ){
                this.reqMap.delete(key);
                nCount +=1;
            }
        });
        return nCount > 0 ?`total ${nCount} index deleted`:null;
    },
    setKV : function(value){
        value[1].REGISTEDDATE = new Date();
        this.reqMap.set(value[0].sessionID,value[1]);
    },
    getValue : function(SID){
        return this.reqMap.get(SID);
    },
    setEXPLIMIT : function(ms){
        if(typeof(ms) === 'number')
            this.EXPLIMIT = ms;
        else throw new Error(`givin parameter is not a number`);
    },
    removeReq : function(key){
        try{
            this.reqMap.delete(key);
            return 0;
        }catch(e){
            throw new Error(e);
        }
        
    }
}