const LocalStrategy = require('passport-local').Strategy; //localLogin Strategy.
const CustomStrategy = require('passport-custom').Strategy;//faceAuth Strategy.
module.exports = (passport,User)=>{

    passport.serializeUser((user,done)=>{//called when strategy is successful
        done(null,user);//var user will be used first attribute for deserializeUser
    });

    passport.deserializeUser((id,done)=>{   //req.user 시 실행되는 함수.
        User.findOne(id.userid,(findErr,users)=>{
            done(null,users);    //var user will be send as req.user
        });
    });

    passport.use('faceAuth',new CustomStrategy(
        (reqId,cb)=>{
            User.findOne(reqId,(findErr,user)=>{
                if(findErr){    //server side error
                    return cb(findErr,null,{message:'Server connection failed!'});   
                }
                else if(!user){      //account is not exist error, returning with msg
                    return cb(null,null,{message:'ID not exist'});
                }
                else{
                    return cb(null,user);
                }
            });
        }
    ));
    /*
        this function is added in project FaceAuth.
        call this function for authficate via face recognization/
        require requestUserId only.
        THIS IS JUST FOR GIVE PASSPORT, ITS NOT CHECK IN THIS FUNCTION.
        FACE AUTH IS IN authServerModuel.js
    */
   
    passport.use('local',new LocalStrategy({ // start of LocalStrategy.
        usernameField: 'reqId',
        passwordField: 'reqPw',
        session: true,
        passReqCallback: true
        },(reqId,reqPw,done)=>{
            User.findOne(reqId,(findErr,user)=>{
                if(findErr){    //server side error
                    return done(findErr,null,{message:'Server connection failed!'});   
                }
                if(!user){      //account is not exist error, returning with msg
                    return done(null,null,{message:'ID not exist'});
                }
                return User.comparePassword(reqId,reqPw,(passErr,isMatch)=>{
                    if(passErr && !isMatch){
                        return done(passErr,null,{message:'ID not exist or Server connection failed'});
                    }else if(!passErr && isMatch===true){
                        return done(null,user,null);
                    }else if(!passErr&& isMatch===false){
                        return done(null,null,{message:'PW mismatch'});
                    }else{
                        return done('[Password.js][inUser.comparePassword][ERR]unsolved err',null,{message:'Server connection failed!'});
                    }
                });
            });
        }
    ));
}