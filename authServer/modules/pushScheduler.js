const scheduler = module.exports = function(){
    this.isBusy = false;
    this.EXPLIMIT = 120000;
    this.requestTime = null;
}
scheduler.prototype = {
    getIsBusy : function(){
        return this.isBusy;
    },
    startPush : function(){
        if(this.isBusy){
            return new Error('Scheduler is busy');
        }else{
            this.isBusy = true;
            this.requestTime = new Date();
            return null;
        }
    },
    setExpLimit : function(newMillisec){
        this.EXPLIMIT = newMillisec;
    },
    getExpLimit : function(){
        return this.EXPLIMIT;
    },
    expireCheck : function(curDate){
        if(this.isBusy){
            if(curDate.getTime() - this.requestTime.getTime() > this.EXPLIMIT ){
                return( new Error('[pushScheduler]Scheduler is reached out of time limit. something went wrong') );
            }    
            return null;
        }
        return null;
    },
    freeScheduler : function(){
        this.isBusy = false;
        this.requestTime = null;
    }
    

}