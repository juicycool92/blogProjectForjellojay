//this scripts are support user request / response who trying to face auth.
//for using this script, import file and declare dynamicly.
//EXPLIMIT is request remain time. notice that if you give single request's life time too long
//and if auth server has porbloms, might be cause performance issue.


var useReqManager = module.exports = function(){
    this.reqMap = new Map();
    this.EXPLIMIT = 120000; // MILLISECOND
}

function logMapElements(value, key, map) {
    console.log(`K[${key}]`);
}
//for debug.

useReqManager.prototype = {
    map : function(){return this.reqMap}, //are we using this? really?
    expireCheck : function(curDate){
        let nCount = 0;
        this.reqMap.forEach((value,key,reqMap) => {
            if(curDate.getTime() - value.res.REGISTEDDATE.getTime() > this.EXPLIMIT ){
                this.reqMap.delete(key);
                nCount +=1;
            }
        });
        return nCount > 0 ?`total ${nCount} index deleted`:null;
    },  
    //this function is check all Map element which is reached EXPLIMIT time,
    //when its reached to EXPDATE, clering request from Map.
    setKV : function(value){ //value from parameter is [req,res]
        value[1].REGISTEDDATE = new Date();
        this.reqMap.set(value[0].sessionID,{req : value[0], res : value[1]});
    },
    //set request to Map.
    //is REGISTEDDATE updated? <-check it after released.

    getValue : function(SID){
        return this.reqMap.get(SID);
    },
    //get values as dictionary type.

    setEXPLIMIT : function(ms){
        if(typeof(ms) === 'number')
            this.EXPLIMIT = ms;
        else throw new Error(`givin parameter is not a number`);
    },
    // its not use right now, but in case of expend time for response, this function will help.

    removeReq : function(key){
        try{
            this.reqMap.delete(key);
            return 0;
        }catch(e){
            throw new Error(e);
        }
        
    },
    //returning 0 if success.

    currentKeys : function(){
        console.log(`디버그용 맵 체커 동작중 :`)
        this.reqMap.forEach(logMapElements);
    }
    //for debug.

}